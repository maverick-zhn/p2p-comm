window.onload = function(){
    var bar = new progress_bar();

    /*var bar = document.getElementById('progress_bar_wrap');

    bar.setPercentage = function(percentage){
        bar.style.width = percentage + '%';
    }*/

    container = document.getElementById('buttons');

    // Progress Bar
    var bar = document.getElementById('progress_bar_wrap');
    var text = document.createElement('div');

    bar.style.width  = '0%';
    text.style.textAlign = 'center';
    text.appendChild(document.createTextNode('0%'));
    bar.appendChild(text);

    // show the peer id
    var buttons = document.createElement('div');
    buttons.className = 'Actions';
    buttons.appendChild(document.createTextNode('Peer ID:'));
    container.appendChild(buttons);

    // show a list of files received / sending
    var filelist = document.createElement('ul');
    filelist.className = 'fileList';
    container.appendChild(filelist);

    // show a file select form
    var fileinput = document.getElementById('browseFile');
    var sendFile = document.getElementById('click');

    // send a file
    fileinput.addEventListener('change', function() {
        sendFile.disabled = false;
        var file = fileinput.files[0];
        console.log("From Event Listener " + file.name);
        //var sender = peer.sendFile(file);

        // create a file item
        var item = document.createElement('li');
        item.className = 'sending';

        // make a label
        var span = document.createElement('span');
        span.className = 'filename';
        span.appendChild(document.createTextNode(file.name));
        item.appendChild(span);

        span = document.createElement('span');
        span.appendChild(document.createTextNode(file.size + ' bytes'));
        item.appendChild(span);

        // create a progress element
        /*var sendProgress = document.createElement('progress');
        sendProgress.max = file.size;
        item.appendChild(sendProgress);*/

        // hook up send progress
        /*sender.on('progress', function (bytesSent) {
            //sendProgress.value = bytesSent;
            bar.setPercentage(20);
        });
        // sending done
        sender.on('sentFile', function () {
            item.appendChild(document.createTextNode('sent'));

            // we allow only one filetransfer at a time
            fileinput.removeAttribute('disabled');
        });
        // receiver has actually received the file
        sender.on('complete', function () {
            // safe to disconnect now
        });*/
        filelist.appendChild(item);
    }, false);

    //fileinput.disabled = 'disabled';
    //container.appendChild(fileinput);

    /*document.getElementById('click').onclick = function(){
        bar.setPercentage(85);
      //bar.style.width = '25%' ;
    }*/
}
