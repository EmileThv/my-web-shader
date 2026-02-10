import * as THREE from 'three';
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp"; // C++ syntax is basically identical to GLSL
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

//1. The engine 

// Renderer Setup
const canvas = document.getElementById('gl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

const container = document.getElementById('render-container');

const width = container.clientWidth;
const height = container.clientHeight;


renderer.setSize(width, height);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const scene = new THREE.Scene();

const geometry = new THREE.PlaneGeometry(2, 2);

//2. Data Bridge

// uniforms
const uniforms = {
  u_time: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_mouse: { value: new THREE.Vector2(0, 0) }
};

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;


// Load initial fragment shader from external file (Vite will inline as string)
import initialFragmentShader from './assets/initial.frag?raw';

// make a material out of the shader

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: initialFragmentShader
});

// put the shader on a mesh of the correct geometry and add it to the three.js scene
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);



//3. Codemirror (IDE) set up

const highlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#ff7bca", fontWeight: "bold" },
  { tag: t.meta, color: "#ff9d00" },
  { tag: t.typeName, color: "#79c0ff" },
  { tag: t.number, color: "#d2a8ff" },
  { tag: t.comment, color: "#8b949e", fontStyle: "italic" },
  { tag: t.variableName, color: "#f8ddff" },
  { tag: t.function(t.variableName), color: "#79c0ff" }
]);

// this was made in part by gemini so might be not so good
let debounceTimer;
const editor = new EditorView({
  doc: initialFragmentShader,
  extensions: [
    basicSetup,
    cpp(),
    syntaxHighlighting(highlightStyle),
    EditorView.theme({
      "&": {
        height: "100%",
        width: "100%",
        backgroundColor: "#1e1e1e",
        color: "#f8ddff",
        fontFamily: "'Fira Code', monospace"
      },
      ".cm-scroller": {
        overflow: "auto"
      },
      ".cm-content": {
        caretColor: "#f8ddff",
        padding: "10px 0"
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#f8ddff"
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "#444"
      },
      ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        color: "#666",
        border: "none"
      },
      ".cm-meta": {
        color: "#ff9d00 !important",
        fontWeight: "bold"
      },
      ".cm-keyword": {
        color: "#ff7bca !important",
        textShadow: "0 0 5px rgba(255, 123, 202, 0.5)"
      },

      ".cm-type": {
        color: "#79c0ff !important"
      },
      ".cm-number": {
        color: "#d2a8ff !important"
      },
      ".cm-comment": {
        color: "#8b949e !important",
        fontStyle: "italic"
      }
    }, { dark: true }),

    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        errorOverlay.classList.remove('is-visible');
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          const newShader = update.state.doc.toString();
          material.fragmentShader = newShader;
          material.needsUpdate = true;
        }, 500)

      }
    })
  ],
  parent: document.getElementById('editor-container')
});

const saveBtn = document.getElementById('save-btn');

saveBtn.addEventListener('click', () => {
  const shaderCode = editor.state.doc.toString();
  let fileName = prompt("Nom du shader :", "my_shader.frag");
  if (fileName === null) return;
  if (!fileName.endsWith('.frag')) {
    fileName += '.frag';
  }
  const blob = new Blob([shaderCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

//4. Render loop

// animation loop
function animate(time) {
  // 'time' comes in seconds
  uniforms.u_time.value = time * 0.01;

  // Draw the scene
  renderer.render(scene, camera);

  // Loop
  requestAnimationFrame(animate);
}

// window resizing
window.addEventListener('resize', handleResize);

function handleResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;

  renderer.setSize(w, h, true);

  uniforms.u_resolution.value.set(w, h);
}

// Track mouse movement
window.addEventListener('mousemove', (event) => {
  // Get the bounding rectangle of the canvas
  const rect = canvas.getBoundingClientRect();

  // Calculate position relative to the canvas (0 to width, 0 to height)
  // We flip the Y coordinate because GLSL starts at the bottom-left
  uniforms.u_mouse.value.x = event.clientX - rect.left;
  uniforms.u_mouse.value.y = rect.height - (event.clientY - rect.top);
});

const errorOverlay = document.getElementById('shader-error-overlay');
renderer.debug.onShaderError = (gl, program, glVertexShader, glFragmentShader) => {
  const log = gl.getShaderInfoLog(glFragmentShader);
  errorOverlay.innerText = log;
  errorOverlay.classList.add('is-visible');
};

handleResize();

// start the loop
requestAnimationFrame(animate);






