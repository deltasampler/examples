#pragma once

#include <stdio.h>
#include <cl/types.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

s32 main() {
    FILE* file = fopen(ROOT_PATH"modules/examples/assets/test.txt", "r");
    char line[256];

    if (file == nullptr) {
        return -1;
    }

    while (fgets(line, sizeof(line), file)) {
        printf("%s", line);
    }

    fclose(file);

    return 0;
}
