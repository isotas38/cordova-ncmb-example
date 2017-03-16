/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        ncmb.File.download("test.pdf", "arraybuffer")
            .then(function (fileData) {
                // ファイル取得後処理
                saveFileToSdcard(fileData);
            })
            .catch(function (err) {
                // エラー処理
            });
    }
};

app.initialize();

var APPLICATION_KEY = "";
var CLIENT_KEY = "";
var ncmb = new NCMB(APPLICATION_KEY, CLIENT_KEY);
ncmb.File.fetchAll().then(function (files) {
    console.log(files);
});

var fileName = "test.pdf";

function saveFileToSdcard(dataObj) {
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "Download", function (directoryEntry) {
        directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            writeFile(fileEntry, dataObj);
        }, function (error) { console.log(error); });
    }, function (error) { console.log(error); });
}

function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function () {
            console.log("Successful file write...");
            readBinaryFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}

function readBinaryFile(fileEntry) {
    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            var fileData = new Blob([new Uint8Array(this.result)], { type: "application/pdf" });

            ncmb.File.upload("testtest.pdf", fileData)
                .then(function (res) {
                    // アップロード後処理
                    console.log(res);
                })
                .catch(function (err) {
                    // エラー処理
                });
            // var data = new FormData();
            // data.append("upName", fileData, "test.pdf");
            // var xhr = new XMLHttpRequest();
            // xhr.withCredentials = true;
            // xhr.addEventListener("readystatechange", function () {
            //     if (this.readyState === 4) {
            //         console.log(this.responseText);
            //     }
            // });
            // xhr.open("POST", "http://192.168.11.3:3000/upload");
            // xhr.send(data);
        };
        reader.readAsArrayBuffer(file);
    }, function (err) {
        console.log(err);
    });
}