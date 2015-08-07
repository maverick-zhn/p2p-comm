'use strict';

function ProgressBar() {
  // Progress Bar
  var bar = document.getElementById('progress_bar_wrap');
  var text = document.createElement('div');

  text.style.textAlign = 'center';
  text.appendChild(document.createTextNode('0%'));

  this.setPercentage = function(percentage){
      bar.style.width = percentage + '%';
      text.removeChild(text.firstChild);
      text.appendChild(document.createTextNode(percentage + '%'));
  }

}
