let y; // y position for my loading animation
let x_raising = true; // this value is for setting if loading goes from left to right or vice versa
let WIDTH; // variable for width of the screen
let HEIGHT; // variable for height of the screen
let x = -70; // setting the start point for my loading animation

let text_color;
let background_color;
let primary_color;
let base_color;

let video;
let detector;
let detections = [];
let show_camera;

let opacity = 255;

function setup() {
  //here I'm setting the that canvas is full screen
  createCanvas(windowWidth, windowHeight);
  //setting up variables for Width and Height
  WIDTH = windowWidth;
  HEIGHT = windowHeight;

  angleMode(DEGREES);
  textAlign(CENTER);
  textFont("Roboto Mono");
  colorMode(RGB);

  day_mode();

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  video.elt.onloadeddata = function() {
    console.log("Video is ready");
    // Now that the video is ready, initialize the object detector
    detector = ml5.objectDetector('cocossd', modelReady);
  };
}

function sun(x, y) {
  fill(255, 293, 0);
  stroke(255, 293, 0);
  strokeWeight(3);
  setLineDash([]);
  push();
  translate(x, y);
  for (i = 0; i < 24; i ++){
    rotate(360 / 24);
    line(0, 0, 0, 50);
  }
  pop();
  circle(x, y, 50);
  noStroke();
}

function moon(x, y){
  fill(161, 161, 161);
  circle(x, y, 50);
  fill(81, 81, 81);
  circle(x - 18, y + 4, 5);
  circle(x - 5, y - 5, 8);
  circle(x + 2, y + 8, 10);
  circle(x - 15, y - 8, 4);
  circle(x + 1, y - 20, 3);
  circle(x + 15, y - 10, 2);
  circle(x + 18, y - 2, 3);
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function day_mode(){
  text_color = color(17, 17, 17);
  background_color = color(0, 182, 221);
  primary_r = 255;
  primary_g = 0;
  primary_b = 184;
  primary_o = 255;
  base_color = color(246, 246, 246);
}

function night_mode(){
  text_color = color(246, 246, 246);
  background_color = color(17, 17, 17);
  primary_r = 255;
  primary_g = 153;
  primary_b = 0;
  primary_o = 255;
  base_color = color(55, 55, 55);
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  detections = results;
  detector.detect(video, gotDetections);
}

function modelReady() {
  detector.detect(video, gotDetections);
  console.log("Model ready!");
}

function draw() {
  translate(width / 2, height / 2);

  //the backgroung color
  background(background_color);

  stroke(text_color);
  strokeWeight(3);
  noFill();
  setLineDash([20, 20]);
  arc(0, 0, 500, 500, 180, 0);

  noStroke();
  
  const angles = [90, 115, 130, 145, 160, 175, 0, 15, 30, 45, 60, 75, 90, 115, 130, 145, 160, 175, 0, 15, 30, 45, 60, 75];
  let add_angles = map(minute(), 0 , 59, 0, 14);
  push();
  if (hour() >= 6 && hour() < 18) {
    day_mode();
    rotate(angles[hour()] + add_angles);
    sun(-250, 0);
  } else {
    night_mode();
    rotate(angles[hour()] + add_angles);
    moon(-250, 0);
  }
  pop();
  

  //the loading path, this for loop creates the small blur in the path, which should be like inner shadow
  //circle(0, 0, 150 - i * 0.4);
  //instead of cirlce add arc
  for (i = 0; i < 20; i++) {
    fill(45 + i * 5, 45 + i * 5, 45 + i * 5, 255 - i * 15);
    circle(0, 0, 150 - i * 0.4);
  }
  fill(background_color);
  circle(0, 0, 130);

  /* here I'm creating loading by drawing 50 circles with decreasing opacity, 
  and using Pythagoras's theorem I'm calculating the y position of the cicles - lines 37 and 48*/
  if (x_raising == true){
    x = x + 0.2;
    for (i = 0; i < 50; i++){
      fill(primary_r, primary_g, primary_b, primary_o - i * 15);
      y = Math.sqrt(4900 - (x - i) ** 2);
      circle(x - i, -y, 10);
    }
    if (x > 70){
      x_raising = false;
    }
  }
  if (x_raising == false){
    x = x - 0.2;
    for (i = 0; i < 50; i++){
      fill(primary_r, primary_g, primary_b, primary_o - i * 15);
      y = Math.sqrt(4900 - (x + i) ** 2);
      circle(x + i, y, 10);
    }
    if (x < -70){
      x_raising = true;
    }
  }
  
  //The clock itself
  textSize(16);
  //Dots representing the hours with a number from 0 to 23
  for (i = 0; i < 24; i ++){
    fill(base_color);
    circle(0, -150, 10);
    fill(text_color);
    text(i, 0, -170);
    rotate(15);
  }
  //Here are the filled dots which shows the time
  for (i = 0; i < hour(); i ++){
    rotate(15);
    fill(primary_r, primary_g, primary_b);
    circle(0, -150, 10);
  }

  rotate((24 - hour()) * 15) //Here I'm rotating canvas to the right position
  fill(text_color);
  textSize(24);
  //Here I display the text with minutes and seconds
  text(minute()+ " : " + second(), 0, 6);

  //There I'm creating the text with actual date in format "Xth of *month year*"
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  text(day() + "th of " + months[month() - 1] + " " + year(), 0, 250);

  if (detections != undefined){
    show_camera = 0;
  }

  if (show_camera % 2 == 0) {
    for (let i = 0; i < detections.length; i++) {
      let object = detections[i];
      image(video, -320, -240);
      fill(40, 40, 40, opacity);
      rect(-320, -240, 640, 50);
      textSize(24);
      textAlign(CENTER);
      fill(240, 240, 240, opacity);
      text("Stay hydrated! Show your bottle or cup!", 0, -200);
      if (object.label == "cup" || object.label == "bottle"){
          fill(240, 240, 240, opacity);
          text("Well done!", 0, -180);
          tint(255, opacity);
          show_camera += 1;
          opacity = 0;
      }
      stroke(0, 255, 0, opacity);
      strokeWeight(4);
      noFill();
      rect( -320 + object.x,  -240 + object.y, object.width, object.height);
      noStroke();
      fill(255, 0 , 0, opacity);
      textSize(24);
      text(object.label, -320 + object.x + object.width / 2, -240 + object.y + 24);
    }
  }
}

