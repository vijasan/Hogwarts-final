"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let expelStudents = [];

const settings = {
  filter: "all",
  sortBy: "firstname",
  sortDir: "asc",
};
// The prototype for all students:
const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  lastname: "",
  gender: "",
  house: "",
  prefect: false,
  inq_squad: false,
  bloodStatus: "",
  expelled: false,
};

function countStudents() {
  const houseCounts = {
    Gryffindor: 0,
    Slytherin: 0,
    Hufflepuff: 0,
    Ravenclaw: 0,
  };
  let numNotExpelled = 0;
  let numExpelled = expelStudents.length;
  let numDisplayed = filterList(allStudents).length;

  allStudents.forEach((student) => {
    if (!student.expelled) {
      numNotExpelled++;
      houseCounts[student.house]++;
    }
  });

  const houseCountsElem = document.getElementById("house-counts");
  houseCountsElem.innerHTML = "";
  for (const house in houseCounts) {
    const count = houseCounts[house];
    const li = document.createElement("li");
    li.textContent = `${house}: ${count}`;
    houseCountsElem.appendChild(li);
  }

  const numNotExpelledElem = document.getElementById("num-not-expelled");
  numNotExpelledElem.textContent = numNotExpelled;

  const numExpelledElem = document.getElementById("num-expelled");
  numExpelledElem.textContent = numExpelled;

  const numDisplayedElem = document.getElementById("num-displayed");
  numDisplayedElem.textContent = numDisplayed;
}

function expelStudent() {
  const popup = document.querySelector(".popup-2");
  const studentName = popup.querySelector(".firstname").value;
  const studentIndex = allStudents.findIndex(
    (student) => student.name === studentName
  );
  if (studentIndex !== -1) {
    const student = allStudents[studentIndex];
    student.expelled = "Expelled";
    expelStudents.push(student);
    allStudents.splice(studentIndex, 1);
    buildList();
    buildExpelList();
  }
}

function buildExpelList() {
  const expelledList = document.querySelector("#expelledList tbody");
  expelledList.innerHTML = "";

  for (const student of expelStudents) {
    const row = document.createElement("tr");

    const firstNameCell = document.createElement("td");
    firstNameCell.textContent = student.firstname;

    const middleNameCell = document.createElement("td");
    middleNameCell.textContent = student.middlename;

    const lastNameCell = document.createElement("td");
    lastNameCell.textContent = student.lastname;

    const houseCell = document.createElement("td");
    houseCell.textContent = student.house;

    row.append(firstNameCell, middleNameCell, lastNameCell, houseCell);
    expelledList.appendChild(row);
  }
}

function start() {
  // TODO: Add event-listeners to filter and sort buttons
  registerButtons();
  loadJSON();
}
function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));

  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));

  document.querySelector("#searchButton").addEventListener("click", search);

  document
    .querySelector("#expel-button")
    .addEventListener("click", expelStudent);
  document
    .querySelector("#hack-button")
    .addEventListener("click", hackTheSystem);
}

async function loadJSON() {
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
  loadBloodStatus(); // load blood status after loading student data
}

async function loadBloodStatus() {
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const jsonData = await response.json();

  allStudents.forEach((student) => {
    const lastName = student.lastname.toLowerCase();
    const family = Object.keys(jsonData).find((key) =>
      jsonData[key].some((name) => lastName === name.toLowerCase())
    );
    student.bloodStatus =
      family === "pure"
        ? "Pure-blood"
        : family === "half"
        ? "Half-blood"
        : "Muggle-born";
  });
  buildList();
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  buildList();
}

function prepareObject(jsonObject) {
  const student = Object.create(Student);

  const texts = jsonObject.fullname.trim().split(" ");
  student.firstname = texts[0];
  student.middlename = getMiddleNames(texts);
  student.lastname = texts.pop();
  student.gender = capitalize(jsonObject.gender);
  student.house = jsonObject.house
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase()); // capitalize the first letter of each word

  return student;
}

function getMiddleNames(nameArray) {
  if (nameArray.length > 2) {
    let middleNames = "";
    for (let i = 1; i < nameArray.length - 1; i++) {
      if (nameArray[i] === "Ernie") {
        middleNames += `"${capitalize(nameArray[i])}" `;
      } else {
        middleNames += capitalize(nameArray[i]) + " ";
      }
    }
    return middleNames.trim();
  } else {
    return "";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`user selected ${filter}`);
  //filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  if (filter === "search") {
    settings.filterBy = "search";
  } else {
    settings.filterBy = filter;
  }
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "gryffindor") {
    //filter for Gryffindor
    filteredList = allStudents.filter(isGry);
  } else if (settings.filterBy === "slytherin") {
    //filter for Slytherin
    filteredList = allStudents.filter(isSly);
  } else if (settings.filterBy === "hufflepuff") {
    //filter for Hufflepuff
    filteredList = allStudents.filter(isHuf);
  } else if (settings.filterBy === "ravenclaw") {
    //filter for Ravenclaw
    filteredList = allStudents.filter(isRav);
  } else if (settings.filterBy === "expelled") {
    filteredList = allStudents.filter(isExpelled);
  }
  return filteredList;
}

function isGry(student) {
  return student.house === "Gryffindor";
}
function isSly(student) {
  return student.house === "Slytherin";
}
function isHuf(student) {
  return student.house === "Hufflepuff";
}
function isRav(student) {
  return student.house === "Ravenclaw";
}

function isExpelled(student) {
  return student.firstName === "Expelled";
}
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //find "old" sortby element
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortBy");

  //indicate active sort
  event.target.classList.add("sortBy");

  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`user selected ${sortBy}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    let propA = studentA[settings.sortBy].toLowerCase();
    let propB = studentB[settings.sortBy].toLowerCase();

    if (propA < propB) {
      return -1 * direction;
    } else if (propA > propB) {
      return 1 * direction;
    } else {
      return 0;
    }
  }

  return sortedList;
}

function sortByProperty(studentA, studentB) {
  if (settings.sortBy === "firstname") {
    return "firstname";
  } else if (settings.sortBy === "lastname") {
    return "lastname";
  } else {
    return "firstname";
  }
}

function search() {
  const searchTerm = document
    .querySelector("#search")
    .value.trim()
    .toLowerCase();
  const filteredList = allStudents.filter((student) => {
    const fullname = `${student.firstname} ${student.lastname}`;
    return fullname.toLowerCase().includes(searchTerm);
  });
  displayList(filteredList);
}
let inquisitorialSquad = [];

function hackTheSystem() {
  // Remove the "Expelled" property from all expelled students
  allStudents.forEach((student) => {
    if (student.expelled === "Expelled") {
      delete student.expelled;
      expelStudents.splice(expelStudents.indexOf(student), 1);
      allStudents.push(student);
    }
  });

  // Create a new student object with the properties of the prototype Student
  const hacker = Object.create(Student);

  // Add a new student to the student list
  hacker.firstname = "Vijasan";
  hacker.lastname = "Vasantharajan";
  hacker.gender = "Male";
  hacker.house = "Slytherin";
  hacker.bloodStatus = "just a chill guy :)";
  hacker.expelled = false;

  allStudents.push(hacker);

  // Add the new student to the inquisitorial squad
  hacker.inquisitorial = true;
  inquisitorialSquad.push(hacker);

  // Randomly modify blood-status of former pure-bloods
  const bloodStatusOptions = ["Pure-blood", "Half-blood", "Muggle-born"];
  allStudents.forEach((student) => {
    if (student.bloodStatus === "Pure-blood" && !student.expelled) {
      const randomIndex = Math.floor(Math.random() * bloodStatusOptions.length);
      student.bloodStatus = bloodStatusOptions[randomIndex];
    }
  });

  // Update the list with the new student and modified blood-statuses
  buildList();

  // Disable the hack button
  const hackButton = document.querySelector("#hack-button");
  hackButton.disabled = true;
  hackButton.style.backgroundColor = "grey";

  // Remove any students added to the inquisitorial squad after 10 seconds
  setTimeout(() => {
    let studentsRemoved = false;
    inquisitorialSquad.forEach((student) => {
      if (student.inquisitorial) {
        student.inquisitorial = false;
        const squadStar = document.querySelector(
          `[data-student="${student.id}"] [data-field=inqsquad]`
        );
        if (squadStar) {
          squadStar.textContent = "☆";
        }
        studentsRemoved = true;
      }
    });
    inquisitorialSquad = inquisitorialSquad.filter(
      (student) => !student.inquisitorial
    );

    if (studentsRemoved) {
      buildList();
      // Notify the user that the students were removed
      alert("Students have been removed from the inquisitorial squad.");
    }

    // Reset inquisitorial squad status for all students
    allStudents.forEach((student) => {
      student.inquisitorial = false;
    });

    // Remove the golden star from all table cells
    const squadStars = document.querySelectorAll("[data-field=inqsquad]");
    squadStars.forEach((star) => {
      star.textContent = "☆";
    });

    // Enable the hack button
    hackButton.disabled = false;
    hackButton.style.backgroundColor = "green";
  }, 10000);
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);
  displayList(sortedList);

  // update the count
  countStudents();
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach((student) => {
    const clone = document
      .querySelector("template#student")
      .content.cloneNode(true);

    // Set data on the clone
    clone.querySelector("[data-field=firstname]").textContent =
      student.firstname;
    clone.querySelector("[data-field=middlename]").textContent =
      student.middlename;
    clone.querySelector("[data-field=lastname]").textContent = student.lastname;
    clone.querySelector("[data-field=gender]").textContent = student.gender;
    clone.querySelector("[data-field=house]").textContent = student.house;
    clone.querySelector("[data-field=prefect]").textContent = student.prefect
      ? "☆"
      : "";
    clone.querySelector("[data-field=inqsquad]").textContent = student.inq_squad
      ? "☆"
      : "";
    clone
      .querySelector(".student-container")
      .classList.add(student.house.toLowerCase());
    clone
      .querySelector(".student-container")
      .addEventListener("click", () => showPopup(student));

    // Display blood status
    clone.querySelector("[data-field=bloodstatus]").textContent =
      student.bloodStatus;

    document.querySelector("#list tbody").appendChild(clone);
  });
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}
function showImage(firstname, lastname) {
  return `images/${lastname.toLowerCase()}_${firstname
    .charAt(0)
    .toLowerCase()}.png`;
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=firstname]").textContent =
    student.firstname.charAt(0).toUpperCase() +
    student.firstname.slice(1).toLowerCase();
  clone.querySelector("[data-field=middlename]").textContent = student.nickname
    ? `"${student.nickname}"`
    : student.middlename
    ? student.middlename
    : "";
  clone.querySelector("[data-field=lastname]").textContent =
    student.lastname.charAt(0).toUpperCase() +
    student.lastname.slice(1).toLowerCase();
  clone.querySelector("[data-field=gender]").textContent =
    student.gender.charAt(0).toUpperCase() +
    student.gender.slice(1).toLowerCase();
  clone.querySelector("[data-field=house]").textContent =
    student.house.charAt(0).toUpperCase() +
    student.house.slice(1).toLowerCase();

  clone.querySelector("[data-field=house]").textContent = student.house;

  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]").textContent = "🌟";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "☆";
  }

  clone
    .querySelector("[data-field=prefect]")
    .addEventListener("click", clickPrefect);

  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }

    buildList();
  }

  function tryToMakeAPrefect(selectedStudent) {
    const prefects = allStudents.filter((student) => student.prefect);
    const numberOfPrefects = prefects.length;

    const numberOfPrefectsInHouse = prefects.filter(
      (student) => student.house === selectedStudent.house
    ).length;

    if (numberOfPrefectsInHouse >= 2) {
      window.alert("There can only be 2 prefects from each house!");
      removeOther(prefects, selectedStudent);
    } else if (numberOfPrefects >= 8) {
      window.alert("There can only be 8 prefects!");
      removeAorB(prefects[0], prefects[1], selectedStudent);
    } else {
      makePrefect(selectedStudent);
    }

    function removeOther(prefects, selectedStudent) {
      const otherPrefectsInHouse = prefects.filter(
        (student) =>
          student.prefect === true && student.house === selectedStudent.house
      );

      removePrefect(otherPrefectsInHouse[0]);
      makePrefect(selectedStudent);
    }

    function removeAorB(prefectA, prefectB, selectedStudent) {
      removePrefect(prefectA);
      removePrefect(prefectB);
      makePrefect(selectedStudent);
    }

    function removePrefect(prefectStudent) {
      prefectStudent.prefect = false;
    }

    function makePrefect(student) {
      student.prefect = true;
    }
  }

  if (student.inqsquad === true) {
    clone.querySelector("[data-field=inqsquad]").textContent = "🌟";
  } else {
    clone.querySelector("[data-field=inqsquad]").textContent = "☆";
  }

  clone
    .querySelector("[data-field=inqsquad]")
    .addEventListener("click", clickSquad);

  function clickSquad() {
    if (student.inqsquad === true) {
      student.inqsquad = false;
    } else if (student.blood === "pure" || student.house === "Slytherin") {
      student.inqsquad = true;
    } else {
      window.alert(
        "Only pure-blood students and Slytherins can be part of the Inquisitorial Squad!"
      );
    }

    buildList();
  }

  // append clone to list
  clone
    .querySelector(".student-container")
    .addEventListener("click", () => visDetaljer(student));
  function visDetaljer(student) {
    popup.style.display = "flex";
    popup.querySelector(".house").textContent = student.house;
    popup.querySelector(".firstname").textContent = capitalize(
      student.firstname
    );
    popup.querySelector(".lastname").textContent = capitalize(student.lastname);
    popup.querySelector(".middlename").textContent = capitalize(
      student.middlename
    );
    popup.querySelector(".picture").src = showImage(
      student.firstname,
      student.lastname
    );
    popup.querySelector(
      ".bloodstatus"
    ).textContent = `Blood status: ${student.bloodStatus}`;
    changePopupColor(student.house);

    popup.querySelector(".prefect").textContent = student.prefect
      ? "Prefect"
      : "Not Prefect";
    popup.querySelector(".expelled").textContent = student.expelled
      ? "Expelled"
      : "Not expelled";
    popup.querySelector(".inqsquad").textContent = student.inquisitorial
      ? "Inq Squad"
      : "Not Inq Squad";
  }

  document
    .querySelector("#luk")
    .addEventListener("click", () => (popup.style.display = "none"));
  document.querySelector("#list tbody").appendChild(clone);
}

function changePopupColor(house) {
  let popupElement = document.getElementById("popup");
  let popupArticleElement = document.getElementById("popup-article");
  let popup1Element = document.querySelector(".popup-1");
  let popup2Element = document.querySelector(".popup-2");
  let color1 = "";
  let color2 = "";

  const colors = {
    Gryffindor: ["#4D0506", "#F3BF1B"],
    Slytherin: ["#25581F", "#9E9996"],
    Ravenclaw: ["#0B304A", "#A67A53"],
    Hufflepuff: ["#F3DE0B", "#0C0D08"],
  };

  switch (house) {
    case "Gryffindor":
      color1 = "#4D0506";
      color2 = "#F3BF1B";
      break;
    case "Slytherin":
      color1 = "#25581F";
      color2 = "#9E9996";
      break;
    case "Ravenclaw":
      color1 = "#0B304A";
      color2 = "#A67A53";
      break;
    case "Hufflepuff":
      color1 = "#F3DE0B";
      color2 = "#0C0D08";
      break;
    default:
      color1 = "white";
      color2 = "white";
  }

  popupElement.style.backgroundImage = `linear-gradient(90deg, ${color1}, ${color1} 50%, ${color2} 50%, ${color2})`;
  popupArticleElement.style.backgroundColor = color1;
  popup1Element.style.backgroundColor = color1;
  popup2Element.style.backgroundColor = color1;
  const popup1 = document.querySelector(".popup-1");
  const popup2 = document.querySelector(".popup-2");
  const houseElement = popup.querySelector(".house");
  const firstNameElement = popup.querySelector(".firstname");
  const lastNameElement = popup.querySelector(".lastname");
  const middleNameElement = popup.querySelector(".middlename");
  const bloodElement = popup.querySelector(".bloodstatus");
  const inqElement = popup.querySelector(".inqsquad");
  const prefectElement = popup.querySelector(".prefect");
  const expelElement = popup.querySelector(".expelled");

  if (house === "Hufflepuff") {
    houseElement.style.color = "black";
    firstNameElement.style.color = "black";
    lastNameElement.style.color = "black";
    middleNameElement.style.color = "black";
    bloodElement.style.color = "black";
    inqElement.style.color = "black";
    prefectElement.style.color = "black";
    expelElement.style.color = "black";
  } else {
    const [color1, color2] = colors[house];
    houseElement.style.color = "white";
    firstNameElement.style.color = "white";
    lastNameElement.style.color = "white";
    middleNameElement.style.color = "white";
    bloodElement.style.color = "white";
    inqElement.style.color = "white";
    prefectElement.style.color = "white";
    expelElement.style.color = "white";
  }
}
