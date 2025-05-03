#pragma once

#include <SDL3/SDL.h>
#include <glad/gl.h>
#include <gl/shader.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

#include <engine/test/context.h>

u32 program;
u32 vao;

void init() {
    program = program_load(ROOT_PATH"modules/examples/assets/simple.glsl");

    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);
}

void shut() {
    glDeleteProgram(program);

    glBindVertexArray(0);
    glDeleteVertexArrays(1, &vao);
}

void process_event(SDL_Event& event) {}
void update() {}

void render() {
    glUseProgram(program);
    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

#include <engine/test/main.h>
