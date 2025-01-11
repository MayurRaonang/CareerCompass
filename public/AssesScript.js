let careerScores = [0, 0, 0, 0, 0, 0, 0];
const careerNames = [
    "User Experience Designer",//1
    "Machine Learning Engineer",//2
    "Database Administrator",//3
    "Full Stack Developer",//4
    "Cloud Engineer",//5
    "Blockchain Developer",//6
    "Cybersecurity Specialist"//7
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
        if(k == 14){
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
    const numKey = parseInt(key, 10); // Convert key to a number
    switch(numKey){
        case 1:
            careerScores[0]++;
            console.log(`score of ${careerNames[0]} is: ${careerScores[0]}`);
            break;
        case 2:
            careerScores[1]++;
            console.log(`score of ${careerNames[1]} is: ${careerScores[1]}`);
            break;
        case 3:
            careerScores[2]++;
            console.log(`score of ${careerNames[2]} is: ${careerScores[2]}`);
            break;
        case 4:
            careerScores[3]++;
            console.log(`score of ${careerNames[3]} is: ${careerScores[3]}`);
            break;
        case 5:
            careerScores[4]++;
            console.log(`score of ${careerNames[4]} is: ${careerScores[4]}`);
            break;
        case 6:
            careerScores[5]++;
            console.log(`score of ${careerNames[5]} is: ${careerScores[5]}`);
            break;
        case 7:
            careerScores[6]++;
            console.log(`score of ${careerNames[6]} is: ${careerScores[6]}`);
            break;
        default:
            console.log("ok");
    }
}

document.getElementById("he").addEventListener("click",findcareer);

function findcareer() {
    for(var i = 0; i < careerScores.length; i++){
        console.log(`score of ${careerNames[i]} is: ${careerScores[i]}`)
    }
    let maxScore = -Infinity; // Initialize with the smallest possible number
    let suitedCareerIndex = -1;
    for (let i = 0; i < careerScores.length; i++) {
        if (careerScores[i] > maxScore) {
            maxScore = careerScores[i];
            suitedCareerIndex = i;
        }
    }
    console.log(`Suited career index is: ${suitedCareerIndex}`);
    
    // Send the suitedCareerIndex to the server
    fetch('/submit-career', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suitedCareerIndex }) // Send only the index
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);
        alert('Career index saved successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
    });

    return suitedCareerIndex;
}


// function addtodatabase(key){
//     const db = new pg.Client({
//         user: "postgres",
//         host: "localhost",
//         database: "world",
//         password: "Mayur@2005",
//         port: 5432,
//       });
//       db.connect();
//     db.query(`insert into visited_country (country_code) values ($1)`,[key]);  
// }