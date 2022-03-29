// import { ethers } from "ethers"

export const getInput = async (privateKey) => {
    // TODO: get real merkleRoot, merklePathElements, and merklePathIndices
    const merkleRoot = 1234;
    const marklePathElements = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    const merklePathIndices = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

    return {
        privKey: null,
        nullifier: null,
        merklePathElements: merklePathElements,
        merklePathIndices: merklePathIndices,
        merkleRoot: merkleRoot,
    }
}
