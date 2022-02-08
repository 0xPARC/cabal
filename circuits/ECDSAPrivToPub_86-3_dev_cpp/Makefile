CC=g++
CFLAGS=-O3 -I.
DEPS_HPP = circom.hpp calcwit.hpp fr.hpp
DEPS_O = main.o calcwit.o fr.o fr_asm.o

all: ECDSAPrivToPub_86-3_dev

%.o: %.cpp $(DEPS_HPP)
	$(CC) -c $< $(CFLAGS)
fr_asm.o: fr.asm
	nasm -felf64 fr.asm -o fr_asm.o

ECDSAPrivToPub_86-3_dev: $(DEPS_O) ECDSAPrivToPub_86-3_dev.o
	$(CC) -o ECDSAPrivToPub_86-3_dev *.o -lgmp
