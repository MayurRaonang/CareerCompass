let careerScores = [0, 0, 0, 0, 0, 0, 0, 0];
const careerNames = [
    "engineering",
    "medicine",
    "arts",
    "business",
    "law",
    "research",
    "education",
    "entrepreneurship"
];
var n = document.querySelectorAll('.ans').length;
var b = document.querySelectorAll('.ans');
var cont = document.querySelectorAll('.questionbox');
const progressBar = document.getElementById('progress-bar');
let k = 0;
for(let i = 0; i < n; i ++){
    b[i].addEventListener("click",function(){
        const a = this.getAttribute("data-careerid");
        const x = this.getAttribute("data-career");
        console.log(`${a} - ${x}`);
        passValue(a);
        cont[k].style.display = 'none';
        k++;
        console.log(`${k}`);
        if(k == 15){
            document.getElementById("complete_button").classList.remove("hidecard");
            document.getElementById("complete_button").classList.add("completebutton");
        }
        else{
            cont[k].style.display = 'grid';
        }
        const progress = ((k ) / cont.length) * 100;
  progressBar.style.width = `${progress}%`;
    });
}
function passValue(key){
    switch(key){
        case 1:
            careerScores[0]++;
        case 2:
            careerScores[1]++;
        case 3:
            careerScores[2]++;
        case 4:
            careerScores[3]++;
        case 5:
            careerScores[4]++;
        case 6:
            careerScores[5]++;
        case 7:
            careerScores[6]++;
        case 8:
            careerScores[7]++;
    }
}
function findcareer(){
    let maxScore = -Infinity; // Initialize with the smallest possible number
    let suitedCareerIndex = -1;
    for (let i = 0; i < careerScores.length; i++) {
        if (careerScores[i] > maxScore) {
            maxScore = careerScores[i];
            suitedCareerIndex = i;
        }
    }
    console.log(`Suited career for you is ${careerNames[suitedCareerIndex]}`)
}