pragma circom 2.0.2;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/multiplexer.circom";

include "bigint.circom";
include "secp256k1.circom";
include "bigint_func.circom";
include "ecdsa_func.circom";
include "secp256k1_func.circom";

// Taken from https://github.com/0xPARC/circom-ecdsa/blob/master/circuits/ecdsa.circom#L14
// keys are encoded as (x, y) pairs with each coordinate being
// encoded with k registers of n bits each
template ECDSAPrivToPub(n, k) {
    var stride = 10;
    signal input privkey[k];
    signal output pubkey[2][k];
    signal input dummyInput;

    component n2b[k];
    for (var i = 0; i < k; i++) {
        n2b[i] = Num2Bits(n);
        n2b[i].in <== privkey[i];
    }

    var num_strides = 258 \ stride;
    if (258 % stride > 0) {
        num_strides = num_strides + 1;
    }
    // power[i][j] contains: [j * (1 << stride * i) * G] for 1 <= j < (1 << stride)
    var powers[258][1024][2][3];
    powers = get_g_pow_stride10_table(86, 3, 258);

    // contains a dummy point to stand in when we are adding 0
    var dummy[2][3];
    // dummy = (2 ** 258) * G
    dummy[0][0] = 35872591715049374896265832;
    dummy[0][1] = 6356226619579407084632810;
    dummy[0][2] = 2978520823699096284322372;
    dummy[1][0] = 26608736705833900595211029;
    dummy[1][1] = 58274658945430015619912323;
    dummy[1][2] = 4380191706425255173800171;

    // selector[i] contains a value in [0, ..., 2**i - 1]
    component selectors[num_strides];
    for (var i = 0; i < num_strides; i++) {
        selectors[i] = Bits2Num(stride);
        for (var j = 0; j < stride; j++) {
            var bit_idx1 = (i * stride + j) \ n;
            var bit_idx2 = (i * stride + j) % n;
            if (bit_idx1 < k) {
                selectors[i].in[j] <== n2b[bit_idx1].out[bit_idx2];
            } else {
                selectors[i].in[j] <== 0;
            }
        }
    }

    // multiplexers[i][l].out will be the coordinates of:
    // selectors[i].out * (2 ** (i * stride)) * G    if selectors[i].out is non-zero
    // (2 ** 258) * G                                if selectors[i].out is zero
    component multiplexers[num_strides][2];
    // select from k-register outputs using a 2 ** stride bit selector
    for (var i = 0; i < num_strides; i++) {
        for (var l = 0; l < 2; l++) {
            multiplexers[i][l] = Multiplexer(k, (1 << stride));
            multiplexers[i][l].sel <== selectors[i].out;
            for (var idx = 0; idx < k; idx++) {
                multiplexers[i][l].inp[0][idx] <== dummy[l][idx];
                for (var j = 1; j < (1 << stride); j++) {
                    multiplexers[i][l].inp[j][idx] <== powers[i][j][l][idx];
                }
            }
        }
    }

    component iszero[num_strides];
    for (var i = 0; i < num_strides; i++) {
        iszero[i] = IsZero();
        iszero[i].in <== selectors[i].out;
    }

    // has_prev_nonzero[i] = 1 if at least one of the selections in privkey up to stride i is non-zero
    component has_prev_nonzero[num_strides];
    has_prev_nonzero[0] = OR();
    has_prev_nonzero[0].a <== 0;
    has_prev_nonzero[0].b <== 1 - iszero[0].out;
    for (var i = 1; i < num_strides; i++) {
        has_prev_nonzero[i] = OR();
        has_prev_nonzero[i].a <== has_prev_nonzero[i - 1].out;
        has_prev_nonzero[i].b <== 1 - iszero[i].out;
    }

    signal partial[num_strides][2][k];
    for (var idx = 0; idx < k; idx++) {
        for (var l = 0; l < 2; l++) {
            partial[0][l][idx] <== multiplexers[0][l].out[idx];
        }
    }

    component adders[num_strides - 1];
    signal intermed1[num_strides - 1][2][k];
    signal intermed2[num_strides - 1][2][k];
    for (var i = 1; i < num_strides; i++) {
        adders[i - 1] = Secp256k1AddUnequal(n, k);
        for (var idx = 0; idx < k; idx++) {
            for (var l = 0; l < 2; l++) {
                adders[i - 1].a[l][idx] <== partial[i - 1][l][idx];
                adders[i - 1].b[l][idx] <== multiplexers[i][l].out[idx];
            }
        }

        // partial[i] = has_prev_nonzero[i - 1] * ((1 - iszero[i]) * adders[i - 1].out + iszero[i] * partial[i - 1][0][idx])
        //              + (1 - has_prev_nonzero[i - 1]) * (1 - iszero[i]) * multiplexers[i]
        for (var idx = 0; idx < k; idx++) {
            for (var l = 0; l < 2; l++) {
                intermed1[i - 1][l][idx] <== iszero[i].out * (partial[i - 1][l][idx] - adders[i - 1].out[l][idx]) + adders[i - 1].out[l][idx];
                intermed2[i - 1][l][idx] <== multiplexers[i][l].out[idx] - iszero[i].out * multiplexers[i][l].out[idx];
                partial[i][l][idx] <== has_prev_nonzero[i - 1].out * (intermed1[i - 1][l][idx] - intermed2[i - 1][l][idx]) + intermed2[i - 1][l][idx];
            }
        }
    }

    for (var i = 0; i < k; i++) {
        for (var l = 0; l < 2; l++) {
            pubkey[l][i] <== partial[num_strides - 1][l][i];
        }
    }
}