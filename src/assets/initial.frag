#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    /* Coordinates normalization */
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    vec2 mouse = (u_mouse.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);

    for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * uv.y + u_time*.1 + i);
        uv.y += 0.6 / i * clamp(tan(i * uv.x + u_time*.05 + i),-5.,5.);
    }

    vec3 color = vec3(0.5 + 0.5 * sin(u_time*.1 + uv.x), 
                      0.5 + 0.5 * cos(u_time*.1+ uv.y), 
                      0.8);

    gl_FragColor = vec4(color / length(uv), 1.0);
}
