var canvas=document.getElementById("board");
var ctx=canvas.getContext("2d");

var questions=[
{id:"q1",category:"MOLES",question:"How many particles are in 1 mole?",answer:"6.022 × 10²³",wrong1:"602",wrong2:"6.022",wrong3:"100"},
{id:"q2",category:"MOLES",question:"How many moles is 12.044 × 10²³ particles?",answer:"2 mol",wrong1:"1 mol",wrong2:"12 mol",wrong3:"0.5 mol"},
{id:"q3",category:"MOLES",question:"How many moles is 6.022 × 10²³ atoms?",answer:"1 mol",wrong1:"2 mol",wrong2:"6 mol",wrong3:"10 mol"},
{id:"q4",category:"MASS",question:"36 g of water equals about?",answer:"2 mol",wrong1:"1 mol",wrong2:"18 mol",wrong3:"36 mol"},
{id:"q5",category:"MASS",question:"How much is 2 mol of water?",answer:"36 g",wrong1:"18 g",wrong2:"9 g",wrong3:"72 g"},
{id:"q6",category:"MASS",question:"What is 0.5 mol of NaCl in grams?",answer:"29.25 g",wrong1:"58.5 g",wrong2:"14 g",wrong3:"117 g"},
{id:"q7",category:"MOLAR MASS",question:"What is the molar mass of H₂O?",answer:"18 g/mol",wrong1:"16 g/mol",wrong2:"20 g/mol",wrong3:"36 g/mol"},
{id:"q8",category:"MOLAR MASS",question:"What is the molar mass of CO₂?",answer:"44 g/mol",wrong1:"28 g/mol",wrong2:"32 g/mol",wrong3:"22 g/mol"},
{id:"q9",category:"MOLAR MASS",question:"Find the molar mass of NaCl.",answer:"58.5 g/mol",wrong1:"23 g/mol",wrong2:"35 g/mol",wrong3:"93 g/mol"},
{id:"q10",category:"MOLES",question:"How many particles are in 0.5 mole?",answer:"3.011 × 10²³",wrong1:"6.022 × 10²³",wrong2:"1.204 × 10²³",wrong3:"12.044 × 10²³"},
{id:"q11",category:"MOLES",question:"How many atoms are in 3 mol of carbon?",answer:"18.066 × 10²³",wrong1:"6.022 × 10²³",wrong2:"3 atoms",wrong3:"12.044 × 10²³"},
{id:"q12",category:"MASS",question:"A mole of water has what mass?",answer:"18 g",wrong1:"36 g",wrong2:"9 g",wrong3:"1 g"},
{id:"q13",category:"HARDER",question:"How many moles are in 44 g of CO₂?",answer:"1 mol",wrong1:"2 mol",wrong2:"44 mol",wrong3:"0.5 mol"},
{id:"q14",category:"HARDER",question:"10 g of H₂O is close to?",answer:"0.556 mol",wrong1:"10 mol",wrong2:"18 mol",wrong3:"1 mol"},
{id:"q15",category:"HARDER",question:"How many particles are in 2 mol?",answer:"12.044 × 10²³",wrong1:"6.022 × 10²³",wrong2:"2 × 10²³",wrong3:"3.011 × 10²³"}
];

var custom=[];var deleted=[];
try{custom=JSON.parse(localStorage.getItem("moleCustom")||"[]")}catch(e){custom=[]}
try{deleted=JSON.parse(localStorage.getItem("moleDeleted")||"[]")}catch(e){deleted=[]}

var snake=[];var answers=[];var direction="right";var nextDirection="right";
var timer=null;var speed=300;var playing=false;var practice=true;
var score=0;var streak=0;var answerCount=0;var questionIndex=0;var grow=0;

function showPage(name){
 ["menu","game","quizGame","addPage","manage","end"].forEach(function(id){document.getElementById(id).className="page hidden"});
 document.getElementById(name).className="page";
}

function getQuestions(){
 var list=[];
 for(var i=0;i<questions.length;i++){if(deleted.indexOf(questions[i].id)===-1)list.push(questions[i])}
 return list.concat(custom);
}

function shuffle(list){return list.sort(function(){return Math.random()-0.5})}

function startGame(){
 score=0;streak=0;answerCount=0;questionIndex=0;grow=0;
 practice=document.getElementById("practice").checked;
 speed=Number(document.getElementById("speedSlider").value);
 snake=[{x:10,y:6},{x:9,y:6},{x:8,y:6},{x:7,y:6},{x:6,y:6}];
 direction="right";nextDirection="right";playing=true;
 document.getElementById("score").textContent="0";
 document.getElementById("streak").textContent="0";
 showPage("game");newQuestion();
 clearInterval(timer);timer=setInterval(move,speed);
}

function newQuestion(){
 var list=getQuestions();if(list.length===0){gameOver();return}
 var item=list[questionIndex%list.length];questionIndex++;
 document.getElementById("category").textContent=item.category;
 document.getElementById("questionText").textContent=item.question;
 document.getElementById("note").textContent="Length: "+snake.length;
 var choices=shuffle([item.answer,item.wrong1,item.wrong2,item.wrong3]);answers=[];
 for(var i=0;i<4;i++){
  var place;do{place={x:3+Math.floor(Math.random()*14),y:2+Math.floor(Math.random()*9)}}while(isUsed(place)||tooClose(place));
  answers.push({x:place.x,y:place.y,text:choices[i],correct:choices[i]===item.answer});
 }
 draw();
}

function isUsed(place){for(var i=0;i<answers.length;i++){if(answers[i].x===place.x&&answers[i].y===place.y)return true}return false}
function tooClose(place){for(var i=0;i<snake.length;i++){if(Math.abs(snake[i].x-place.x)<2&&Math.abs(snake[i].y-place.y)<2)return true}return false}

function move(){
 if(!playing)return;
 direction=nextDirection;
 var head={x:snake[0].x,y:snake[0].y};
 if(direction==="up")head.y--;if(direction==="down")head.y++;
 if(direction==="left")head.x--;if(direction==="right")head.x++;

 if(head.x<0||head.x>=20||head.y<0||head.y>=13){gameOver();return}

 for(var i=1;i<snake.length;i++){if(snake[i].x===head.x&&snake[i].y===head.y){gameOver();return}}

 snake.unshift(head);
 var found=-1;
 for(var j=0;j<answers.length;j++){if(answers[j].x===head.x&&answers[j].y===head.y){found=j;break}}

 if(found<0){
  if(grow>0){grow--}else{snake.pop()}
 }else{collect(answers[found])}
 draw();
}

function turnAround(){if(direction==="right")nextDirection="left";if(direction=== "left")nextDirection="right";if(direction=== "up")nextDirection="down";if(direction=== "down")nextDirection="up"}

function collect(answer){
 playing=false;clearInterval(timer);answerCount++;
 if(answer.correct){
  streak++;score=score+100+streak*10;grow++;
  showMessage("Correct! +"+(100+streak*10),"good");
 }else{
  streak=0;showMessage("Wrong answer!","bad");
 }
 document.getElementById("score").textContent=score;
 document.getElementById("streak").textContent=streak;
 setTimeout(function(){
  document.getElementById("message").className="message hidden";
  if(answer.correct===false){gameOver();return}
  if(snake.length===1){gameOver();return}
  playing=true;newQuestion();clearInterval(timer);timer=setInterval(move,speed);
 },850);
}

function showMessage(text,color){var box=document.getElementById("message");box.textContent=text;box.className="message "+color}

function draw(){
 ctx.fillStyle="#dbeaf1";ctx.fillRect(0,0,600,400);
 ctx.strokeStyle="#cadde4";
 for(var x=0;x<=600;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,400);ctx.stroke()}
 for(var y=0;y<=400;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(600,y);ctx.stroke()}

 for(var i=0;i<answers.length;i++){
  var a=answers[i];ctx.fillStyle=practice&&a.correct?"#98d78f":"#ffe38a";
  ctx.strokeStyle="#58727b";ctx.lineWidth=2;
  ctx.beginPath();ctx.rect(a.x*30+1,a.y*30+4,118,24);ctx.fill();ctx.stroke();
  ctx.fillStyle="#26363b";ctx.font="11px Arial";ctx.textAlign="center";
  ctx.fillText(a.text,a.x*30+60,a.y*30+20);
 }

 for(var j=0;j<snake.length;j++){
  ctx.fillStyle=j===0?"#ef6868":"#eea45c";
  ctx.fillRect(snake[j].x*30+5,snake[j].y*30+5,20,20);
  if(j===0){ctx.fillStyle="#fff";ctx.fillRect(snake[j].x*30+9,snake[j].y*30+9,3,3);ctx.fillRect(snake[j].x*30+18,snake[j].y*30+9,3,3)}
 }
 document.getElementById("note").textContent="Length: "+snake.length;
}

function gameOver(){playing=false;clearInterval(timer);document.getElementById("finalScore").textContent=score;document.getElementById("finalCount").textContent=answerCount;showPage("end")}

function makeList(){var list=getQuestions();var box=document.getElementById("list");box.innerHTML="";for(var i=0;i<list.length;i++){var q=list[i];var row=document.createElement("div");row.className="item";row.appendChild(document.createTextNode(q.category+" - "+q.question));var button=document.createElement("button");button.textContent="Delete";button.className="delete";button.onclick=(function(item){return function(){if(item.id&&item.id[0]==="q")deleted.push(item.id);else custom=custom.filter(function(c){return c!==item});localStorage.setItem("moleDeleted",JSON.stringify(deleted));localStorage.setItem("moleCustom",JSON.stringify(custom));makeList()}})(q);row.appendChild(button);box.appendChild(row)}}

document.getElementById("speedSlider").oninput=function(){speed=Number(this.value);document.getElementById("speedText").textContent=speed>300?"Slow":speed>220?"Medium":"Fast"};
document.querySelectorAll("[data-dir]").forEach(function(button){button.onclick=function(){setDirection(this.dataset.dir)}});
document.onkeydown=function(e){var wanted="";if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")wanted="up";if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")wanted="down";if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")wanted="left";if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")wanted="right";if(wanted)setDirection(wanted)};
function setDirection(wanted){if(wanted==="up"&&direction!=="down")nextDirection=wanted;if(wanted==="down"&&direction!=="up")nextDirection=wanted;if(wanted==="left"&&direction!=="right")nextDirection=wanted;if(wanted==="right"&&direction!=="left")nextDirection=wanted}

document.getElementById("play").onclick=startGame;document.getElementById("again").onclick=startGame;document.getElementById("menuButton").onclick=function(){showPage("menu")};document.getElementById("addButton").onclick=function(){showPage("addPage")};document.getElementById("manageButton").onclick=function(){makeList();showPage("manage")};document.querySelectorAll(".back").forEach(function(b){b.onclick=function(){showPage("menu")}});

document.getElementById("save").onclick=function(){var category=document.getElementById("addCategory").value.trim();var question=document.getElementById("addQuestion").value.trim();var answer=document.getElementById("addAnswer").value.trim();var wrong1=document.getElementById("addWrong1").value.trim();var wrong2=document.getElementById("addWrong2").value.trim();var wrong3=document.getElementById("addWrong3").value.trim();if(!category||!question||!answer||!wrong1||!wrong2||!wrong3){document.getElementById("saved").textContent="Please fill every box.";return}custom.push({category:category.toUpperCase(),question:question,answer:answer,wrong1:wrong1,wrong2:wrong2,wrong3:wrong3});localStorage.setItem("moleCustom",JSON.stringify(custom));document.getElementById("saved").textContent="Saved! You can add another question.";document.getElementById("addCategory").value="";document.getElementById("addQuestion").value="";document.getElementById("addAnswer").value="";document.getElementById("addWrong1").value="";document.getElementById("addWrong2").value="";document.getElementById("addWrong3").value=""};

document.getElementById("export").onclick=function(){var blob=new Blob([JSON.stringify(getQuestions(),null,2)],{type:"application/json"});var link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="mole-questions.json";link.click();URL.revokeObjectURL(link.href)};
document.getElementById("importButton").onclick=function(){document.getElementById("importFile").click()};
document.getElementById("importFile").onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var data=JSON.parse(reader.result);if(!Array.isArray(data))throw new Error();for(var i=0;i<data.length;i++){if(data[i].question&&data[i].answer)custom.push({category:(data[i].category||"CUSTOM").toUpperCase(),question:data[i].question,answer:data[i].answer,wrong1:data[i].wrong1||data[i].wrong||"Not this",wrong2:data[i].wrong2||"Not this",wrong3:data[i].wrong3||"Not this"})}localStorage.setItem("moleCustom",JSON.stringify(custom));makeList();alert("Questions imported!")}catch(error){alert("That file could not be imported.")}};reader.readAsText(file)};

var quizTimer=null;
var quizTime=30;
var quizScore=0;
var quizIndex=0;

function startQuiz(){
 quizScore=0;quizTime=30;quizIndex=0;
 document.getElementById("quizScore").textContent="0";
 document.getElementById("quizTime").textContent="30";
 showPage("quizGame");
 showQuizQuestion();
 clearInterval(quizTimer);
 quizTimer=setInterval(function(){
  quizTime--;
  document.getElementById("quizTime").textContent=quizTime;
  if(quizTime<=0){clearInterval(quizTimer);endQuiz()}
 },1000);
}

function showQuizQuestion(){
 var list=getQuestions();
 if(list.length===0)return;
 var item=list[quizIndex%list.length];quizIndex++;
 document.getElementById("quizCategory").textContent=item.category;
 document.getElementById("quizQuestionText").textContent=item.question;
 var choices=shuffle([item.answer,item.wrong1,item.wrong2,item.wrong3]);
 var box=document.getElementById("quizAnswers");box.innerHTML="";
 choices.forEach(function(text){
  var button=document.createElement("button");
  button.textContent=text;button.className="quizAnswer";
  button.onclick=function(){
   var buttons=document.querySelectorAll(".quizAnswer");
   buttons.forEach(function(b){b.disabled=true});
   if(text===item.answer){button.classList.add("correct");quizScore=quizScore+100}
   else{button.classList.add("wrong");buttons.forEach(function(b){if(b.textContent===item.answer)b.classList.add("correct")})}
   document.getElementById("quizScore").textContent=quizScore;
   setTimeout(showQuizQuestion,700);
  };
  box.appendChild(button);
 });
}

function endQuiz(){
 alert("Answer Rush score: "+quizScore);
 showPage("menu");
}

document.getElementById("quizButton").onclick=startQuiz;
document.getElementById("quizQuit").onclick=function(){clearInterval(quizTimer);showPage("menu")};
