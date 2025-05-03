#pragma once

#include <SDL3/SDL.h>
#include <glad/gl.h>
#include <cl/camera/cam3.h>
#include <gl/shader.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

#include <engine/test/context.h>

cam3_t cam;

u32 program;
u32 vao;
s32 u_projection;
s32 u_view;

const bool* keystate;

void init() {
    cam = cam3_new();

    program = program_load(ROOT_PATH"modules/examples/assets/camera.glsl");
    u_projection = glGetUniformLocation(program, "u_projection");
    u_view = glGetUniformLocation(program, "u_view");

    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    keystate = SDL_GetKeyboardState(0);
}

void shut() {
    glDeleteProgram(program);

    glBindVertexArray(0);
    glDeleteVertexArrays(1, &vao);
}

void process_event(SDL_Event& event) {
    if (event.type == SDL_EVENT_MOUSE_MOTION) {
        if (SDL_GetWindowRelativeMouseMode(context.window)) {
            cam3_pan(cam, event.motion.xrel);
            cam3_tilt(cam, event.motion.yrel);
        }
    }
}

void update() {
    if (SDL_GetWindowRelativeMouseMode(context.window)) {
        if (keystate[SDL_SCANCODE_A]) {
            cam3_move_right(cam, -1.0f);
        }

        if (keystate[SDL_SCANCODE_D]) {
            cam3_move_right(cam, 1.0f);
        }

        if (keystate[SDL_SCANCODE_S]) {
            cam3_move_forward(cam, -1.0f);
        }

        if (keystate[SDL_SCANCODE_W]) {
            cam3_move_forward(cam, 1.0f);
        }
    }

    cam3_fru(cam);
    cam3_compute_proj(cam, context.viewport_x, context.viewport_y);
    cam3_compute_view(cam);
}

void render() {
    glUseProgram(program);
    glUniformMatrix4fv(u_projection, 1, false, cam.projection.arr);
    glUniformMatrix4fv(u_view, 1, false, cam.view.arr);
    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

#include <engine/test/main.h>
