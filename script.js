"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

// The prototype for all students:
const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  lastname: "",
  gender: "",
  house: "",
  Expel: false,
};
const settings = {
  filter: "all",
  sortBy: "firstname",
  sortDir: "asc",
};

function start() {
  console.log("ready");

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
}

async function loadJSON() {
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
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
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
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

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);
  displayList(sortedList);
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
    changePopupColor(student.house);
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

  if (house === "Hufflepuff") {
    houseElement.style.color = "black";
    firstNameElement.style.color = "black";
    lastNameElement.style.color = "black";
    middleNameElement.style.color = "black";
  } else {
    const [color1, color2] = colors[house];
    houseElement.style.color = "white";
    firstNameElement.style.color = "white";
    lastNameElement.style.color = "white";
    middleNameElement.style.color = "white";
  }
}
