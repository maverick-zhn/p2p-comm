'use strict';

function progress_bar() {
    var bar = document.getElementById('progress_bar_wrap');
    var text = document.createElement('div');
    
    bar.style.width  = '0%';    
        
    
    text.style.textAlign = 'center';
    //text.style.color = ''
    text.appendChild(document.createTextNode('0%'));
    bar.appendChild(text);    
    
    this.setPercentage = function(percentage){
        bar.style.width = percentage + '%'; 
        text.removeChild(text.firstChild);
        text.appendChild(document.createTextNode(percentage + '%'));                
    }
    
}