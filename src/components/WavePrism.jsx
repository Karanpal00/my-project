import React, { useEffect, useRef } from "react";
import { Scene, OrthographicCamera, Material, WebGLRenderer, Mesh, BufferAttribute, BufferGeometry, RawShaderMaterial, DoubleSide, Color } from "three";

const cssVariableRegex = /var\s*\(\s*(--[\w-]+)(?:\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*))?\s*\)/;

function extractDefaultValue(cssVar) {
  if (!cssVar || !cssVar.startsWith("var(")) return cssVar;
  const match = cssVariableRegex.exec(cssVar);
  if (!match) return cssVar;
  const fallback = (match[2] || "").trim();
  if (fallback.startsWith("var(")) return extractDefaultValue(fallback);
  return fallback || cssVar;
}

function resolveTokenColor(input) {
  if (typeof input !== "string") return input;
  if (!input.startsWith("var(")) return input;
  return extractDefaultValue(input);
}

function parseColorToRgba(input) {
  if (!input) return { r: 0, g: 0, b: 0, a: 0 };
  const str = input.trim();
  const rgbaMatch = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgbaMatch) {
    const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255;
    const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255;
    const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255;
    const a = rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1;
    return { r, g, b, a };
  }
  const hex = str.replace(/^#/, "");
  if (hex.length === 8) {
    return { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255, a: parseInt(hex.slice(6, 8), 16) / 255 };
  }
  if (hex.length === 6) {
    return { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255, a: 1 };
  }
  if (hex.length === 4) {
    return { r: parseInt(hex[0] + hex[0], 16) / 255, g: parseInt(hex[1] + hex[1], 16) / 255, b: parseInt(hex[2] + hex[2], 16) / 255, a: parseInt(hex[3] + hex[3], 16) / 255 };
  }
  if (hex.length === 3) {
    return { r: parseInt(hex[0] + hex[0], 16) / 255, g: parseInt(hex[1] + hex[1], 16) / 255, b: parseInt(hex[2] + hex[2], 16) / 255, a: 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function mapLinear(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function mapSpeedUiToInternal(ui) { return mapLinear(ui, .1, 1, .1, 5); }
function mapThicknessUiToInternal(ui) { return mapLinear(ui, .1, 1, .01, .2); }
function mapDistortionUiToInternal(ui) { return mapLinear(ui, 0, 1, 0, .2); }
function mapFrequencyUiToInternal(ui) { return mapLinear(ui, .1, 1, .1, 3); }
function mapAmplitudeUiToInternal(ui) { return mapLinear(ui, .1, 1, .1, 2); }

export default function WavePrism(props) {
  const { 
    speed = 0.2, 
    beamThickness = 0.25, 
    distortion = 0.25, 
    xScale = 0.2, 
    yScale = 0.25, 
    glow = 1, 
    backgroundColor = "#050505" 
  } = props;
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const speedRef = useRef(mapSpeedUiToInternal(speed));
  const sceneRef = useRef({ scene: null, camera: null, renderer: null, mesh: null, uniforms: null, animationId: null });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    
    const { current: refs } = sceneRef;
    
    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float yOffset;
      uniform float distortion;
      uniform float beamThickness;
      uniform float glow;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = beamThickness / abs((p.y + yOffset) + sin((rx + time) * xScale) * yScale);
        float g = beamThickness / abs((p.y + yOffset) + sin((gx + time) * xScale) * yScale);
        float b = beamThickness / abs((p.y + yOffset) + sin((bx + time) * xScale) * yScale);
        
        vec3 wave = vec3(r, g, b);
        float haloCap = 2.0;
        vec3 halo = min(wave, vec3(haloCap));
        vec3 core = wave - halo;
        vec3 col = clamp(core + halo * glow, 0.0, 1.0);
        
        float outAlpha = clamp(max(max(col.r, col.g), col.b) / 2.5, 0.0, 1.0);
        gl_FragColor = vec4(col, outAlpha);
      }
    `;
    
    const initScene = () => {
      refs.scene = new Scene();
      refs.renderer = new WebGLRenderer({ canvas, preserveDrawingBuffer: true, antialias: false, alpha: true });
      refs.renderer.setPixelRatio(window.devicePixelRatio);
      refs.renderer.setClearColor(new Color(0, 0, 0), 0);
      refs.renderer.setScissorTest(false);
      refs.camera = new OrthographicCamera(-1, 1, 1, -1, 0, -1);
      
      refs.uniforms = {
        resolution: { value: [1, 1] },
        time: { value: 0 },
        xScale: { value: mapFrequencyUiToInternal(xScale) },
        yScale: { value: mapAmplitudeUiToInternal(yScale) },
        distortion: { value: mapDistortionUiToInternal(distortion) },
        yOffset: { value: -1 },
        beamThickness: { value: mapThicknessUiToInternal(beamThickness) },
        glow: { value: glow }
      };
      
      const position = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
      const positions = new BufferAttribute(new Float32Array(position), 3);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", positions);
      
      const material = new RawShaderMaterial({ vertexShader, fragmentShader, uniforms: refs.uniforms, side: DoubleSide });
      refs.mesh = new Mesh(geometry, material);
      refs.scene.add(refs.mesh);
      
      handleResize();
    };
    
    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms || !container) return;
      const cw = container.clientWidth || container.offsetWidth || 1;
      const ch = container.clientHeight || container.offsetHeight || 1;
      refs.renderer.setSize(cw, ch, false);
      refs.uniforms.resolution.value = [cw, ch];
      refs.uniforms.yOffset.value = -1;
      if (refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera);
      }
    };
    
    initScene();
    window.addEventListener("resize", handleResize);
    
    return () => {
      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }
      window.removeEventListener("resize", handleResize);
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh);
        refs.mesh.geometry.dispose();
        if (refs.mesh.material instanceof Material) {
          refs.mesh.material.dispose();
        }
      }
      refs.renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    const { current: refs } = sceneRef;
    if (refs.uniforms) {
      refs.uniforms.xScale.value = mapFrequencyUiToInternal(xScale);
      refs.uniforms.yScale.value = mapAmplitudeUiToInternal(yScale);
      refs.uniforms.distortion.value = mapDistortionUiToInternal(distortion);
      refs.uniforms.yOffset.value = -1;
      refs.uniforms.beamThickness.value = mapThicknessUiToInternal(beamThickness);
      refs.uniforms.glow.value = glow;
    }
  }, [xScale, yScale, distortion, beamThickness, glow]);

  useEffect(() => {
    speedRef.current = mapSpeedUiToInternal(speed);
  }, [speed]);

  useEffect(() => {
    const { current: refs } = sceneRef;
    if (refs.animationId) {
      cancelAnimationFrame(refs.animationId);
      refs.animationId = null;
    }
    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += .01 * speedRef.current;
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera);
      }
      refs.animationId = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "fixed", zIndex: -1, top: 0, left: 0, display: "block", margin: 0, padding: 0, background: backgroundColor || "transparent", pointerEvents: "none" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
