#include <stdlib.h>
#include <stdio.h>

#ifndef ROOT_PATH
#define ROOT_PATH "./"
#endif

int32_t main(int32_t, char**) {
    FILE* file = fopen(ROOT_PATH"assets/test.txt", "r");
    size_t cap = 0;
    char* line = nullptr;
    size_t line_len = 0;

    if (file == nullptr) {
        return -1;
    }

    while ((line_len = getline(&line, &cap, file)) != -1) {
        printf("%s", line);
    }

    fclose(file);

    if (line) {
        free(line);
    }

    return 0;
}
