const { BehaviorSubject, combineLatest, fromEvent, pipe, map, startWith } = rxjs;

const toolState = new BehaviorSubject(centruaSmallState);

const chamberState$ = fromEvent(document.querySelectorAll(".form-select,.chamber_state"), "change");
chamberState$.subscribe((e) => {
  const id = e.target.id;
  const newProcessState = e.target.options[e.target.selectedIndex].value;

  updateToolChamberState(id, { processState: newProcessState });
});

const alarmState$ = fromEvent(document.querySelectorAll(".form-check-input.chamber_alarm"), "change");
alarmState$.subscribe((e) => {
  const id = e.target.id.split("_alarm")[0];
  const newAlarmState = e.target.checked;

  updateToolChamberState(id, { isAlarm: newAlarmState });
});

const displayState$ = fromEvent(document.querySelectorAll(".form-check-input.chamber_display"), "change");
displayState$.subscribe((e) => {
  const id = e.target.id.split("_display")[0];
  const newDisplayState = e.target.checked;

  updateToolChamberState(id, { display: newDisplayState });
});

const updateToolChamberState = (chamberId, updatedProperty) => {
  const currentState = toolState.getValue();
  const currentChanmbersState = currentState.chambers;
  const currentchamberState = currentChanmbersState.find((c) => c.id === chamberId);

  const newChamberState = { ...currentchamberState, ...updatedProperty };
  const newChambersState = currentChanmbersState.map((c) => {
    if (c.id === chamberId) {
      return newChamberState;
    }
    return c;
  });

  const newState = { ...currentState, chambers: newChambersState };
  toolState.next(newState);
};

// Tool selector
const toolSelectorElm = document.getElementById("select-tool");
const toolSelectorChange$ = fromEvent(toolSelectorElm, "change").pipe(
  map((e) => e.target.value),
  startWith("centrua-small")
);

// Zoom
const zoomElm = document.getElementById("zoom");
const zoomChange$ = fromEvent($("#zoom"), "change").pipe(
  map((e) => getScaledValue(e.target.value, 0, 100, 0.5, 1.5)),
  startWith(1)
);

// Rotation
const rotationElm = document.getElementById("rotation");
const rotationChange$ = fromEvent($("#rotation"), "change").pipe(
  map((e) => getScaledValue(e.target.value, 0, 100, -180, 180)),
  startWith(0)
);

// On Zoom or Rotation change
combineLatest([zoomChange$, rotationChange$]).subscribe(([zoomValue, rotationValue]) => {
  const elm = document.querySelector("#svg-container > svg");
  if (!elm) return;
  elm.setAttribute("transform", `scale(${zoomValue}) rotate(${rotationValue})`);
});

// On selected tool change
toolSelectorChange$.subscribe((tool) => {
  if (tool === "centrua-small") {
    insertSvg(centuraSmallSvg);
    toolState.next(centruaSmallState);
  } else {
    insertSvg(centruaBigSvg);
    toolState.next(centruaBigState);
  }
});

toolState.subscribe((state) => {
  // Set chamber display
  state.chambers.forEach((chamber) => {
    const currProcState = chamber.processState;
    const currProcStateColor = PROCESS_STATES[currProcState];
    const containerElm = document.getElementById(chamber.id);
    const backgroundElm = document.getElementById(getBackgroundElmId(chamber.id));
    const stageElm = document.getElementById(getStageElmId(chamber.id));
    backgroundElm.setAttribute("fill", currProcStateColor.backgroundColor);
    stageElm.setAttribute("fill", currProcStateColor.stageColor);

    // If isAlarm is true, add flash class
    if (chamber.isAlarm) {
      backgroundElm.classList.add("flash");
    } else {
      backgroundElm.classList.remove("flash");
    }

    // If display is false, hide chamber
    if (!chamber.display) {
      containerElm.style.display = "none";
    } else {
      containerElm.style.display = "block";
    }
  });

  // Set form values
  state.chambers.forEach((chamber) => {
    const formSelectElm = document.querySelectorAll(`#${chamber.id}.form-select.chamber_state`)[0];
    formSelectElm.value = chamber.processState;
  });

  // Set alarm form values
  state.chambers.forEach((chamber) => {
    const formSelectElm = document.getElementById(`${chamber.id}_alarm`);
    formSelectElm.checked = chamber.isAlarm;
  });

  // Set display form values
  state.chambers.forEach((chamber) => {
    const formSelectElm = document.getElementById(`${chamber.id}_display`);
    formSelectElm.checked = chamber.display;
  });
});
