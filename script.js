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
};
const settings = { filter: "all", sortBy: "firstname", sortDir: "asc" };

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

  // TODO: This might not be the function we want to call first
  buildList();
}

function prepareObject(jsonObject) {
  const student = Object.create(Student);

  const texts = jsonObject.fullname.trim().split(" ");
  student.firstname = texts[0];
  student.middlename = getMiddleNames(texts);
  student.lastname = texts.pop();
  student.gender = capitalize(jsonObject.gender);
  student.house = capitalize(jsonObject.house);

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
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  //let filteredList = allAnimals;
  if (settings.filterBy === "gryffindor") {
    //filter for cats
    filteredList = allStudents.filter(isGry);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSly);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHuf);
  } else if (settings.filterBy === "ravenclaw") {
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
  document.querySelector("#list tbody").appendChild(clone);
}
