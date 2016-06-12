/*
 * Crypto-JS v2.5.1
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2011 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */

    importScripts('upload_html5.CryptoJS.js');
    function digits(number, dig) {
        var shift = Math.pow(10, dig);
        return Math.floor(number * shift) / shift;
    }

    function swapendian32(val) {
        return (((val & 0xFF) << 24)
            | ((val & 0xFF00) << 8)
            | ((val >> 8) & 0xFF00)
            | ((val >> 24) & 0xFF)) >>> 0;

    }

    function arrayBufferToWordArray(arrayBuffer) {
        var fullWords = Math.floor(arrayBuffer.byteLength / 4);
        var bytesLeft = arrayBuffer.byteLength % 4;

        var u32 = new Uint32Array(arrayBuffer, 0, fullWords);
        var u8 = new Uint8Array(arrayBuffer);

        var cp = [];
        for (var i = 0; i < fullWords; ++i) {
            cp.push(swapendian32(u32[i]));
        }

        if (bytesLeft) {
            var pad = 0;
            for (var i = bytesLeft; i > 0; --i) {
                pad = pad << 8;
                pad += u8[u8.byteLength - i];
            }

            for (var i = 0; i < 4 - bytesLeft; ++i) {
                pad = pad << 8;
            }

            cp.push(pad);
        }

        return CryptoJS.lib.WordArray.create(cp, arrayBuffer.byteLength);
    };

    function bytes2si(bytes, outputdigits) {
        if (bytes < 1024) { // Bytes
            return digits(bytes, outputdigits) + " b";
        }
        else if (bytes < 1048576) { // KiB
            return digits(bytes / 1024, outputdigits) + " KiB";
        }

        return digits(bytes / 1048576, outputdigits) + " MiB";
    }

    function bytes2si2(bytes1, bytes2, outputdigits) {
        var big = Math.max(bytes1, bytes2);

        if (big < 1024) { // Bytes
            return bytes1 + "/" + bytes2 + " b";
        }
        else if (big < 1048576) { // KiB
            return digits(bytes1 / 1024, outputdigits) + "/" +
                digits(bytes2 / 1024, outputdigits) + " KiB";
        }

        return digits(bytes1 / 1048576, outputdigits) + "/" +
            digits(bytes2 / 1048576, outputdigits) + " MiB";
    }
    function chunkRead(blob, work, done) {
        var reader = new FileReader();
        reader.onload = function (e) {
            work(e.target.result);
            done(blob);
        }
        reader.readAsArrayBuffer(blob);
    }

    function selectFile(f,callback) {
        (function () {
            var start = (new Date).getTime();
            var lastprogress = 0;
            var alg = {name: "SHA256", type: CryptoJS.algo.SHA256};
            var enabledAlgorithms = [{name: "SHA256", instance: alg.type.create(alg.param)}];
            chunkRead(f,
                function (data, pos, file) {
                    var wordArray = arrayBufferToWordArray(data);
                    enabledAlgorithms[0].instance.update(wordArray);
                },
                function (file) {
                    // Done
                    var took = ((new Date).getTime() - start) / 1000;
                    var hash = enabledAlgorithms[0].instance.finalize();
                    var strHash='' + hash;
                    callback(strHash);
                });
        })();
    }

self.addEventListener('message', function (event) {
        var fileId=event.data.fileId;
        var start=event.data.start;
        var end=event.data.end;
        var size=event.data.size;
        selectFile(event.data.blob,function(hash){
            self.postMessage({hash:hash,fileId:fileId,start:start,end:end,size:size});
        })
}, false);