import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import difference from 'lodash.difference';
import Keyboard from './Keyboard';
import webmidi from 'webmidi'



function ControlledPiano(props) {
  
  webmidi.enable(function (err) {
    let inputs = webmidi.inputs;
    for (const input in inputs) {
      let _input = inputs[input];
      _input.addListener('noteon', "all", function(e) {
        onPlayNoteInput(e);
      });
      _input.addListener('noteoff', "all", function (e) {
        onStopNoteInput(e);
      });
    }
  });
  var prevProps = React.useRef();

  let [isMouseDown, setMouseDown] = React.useState();
  let [useTouchEvents, setTouchEvents] = React.useState();
  React.useEffect(() => {
    if (props.activeNotes !== prevProps.activeNotes) {
      
      handleNoteChanges({
        prevActiveNotes: prevProps.activeNotes || [],
        nextActiveNotes: props.activeNotes || [],
      });
      prevProps = props.activeNotes
    }
  });

  // This function is responsible for diffing activeNotes
  // and playing or stopping notes accordingly.
  const handleNoteChanges = ({ prevActiveNotes, nextActiveNotes }) => {
    if (props.disabled) {
      return;
    }
    const notesStopped = difference(prevActiveNotes, nextActiveNotes);
    const notesStarted = difference(nextActiveNotes, prevActiveNotes);

  };

  const getMidiNumberForKey = (key) => {
    if (!props.keyboardShortcuts) {
      return null;
    }
    const shortcut = props.keyboardShortcuts.find((sh) => sh.key === key);
    return shortcut && shortcut.midiNumber;
  };

  const getKeyForMidiNumber = (midiNumber) => {
    if (!props.keyboardShortcuts) {
      return null;
    }
    const shortcut = props.keyboardShortcuts.find((sh) => sh.midiNumber === midiNumber);
    return shortcut && shortcut.key;
  };


  const onPlayNoteInput = (midiNumber) => {
    if (props.disabled) {
      return;
    }
    // Pass in previous activeNotes for recording functionality
    props.onPlayNoteInput(midiNumber, props.activeNotes);
  };

  const onStopNoteInput = (midiNumber) => {
    if (props.disabled) {
      return;
    }
    // Pass in previous activeNotes for recording functionality
    props.onStopNoteInput(midiNumber, props.activeNotes);
  };

  const onMouseDown = () => {
      setMouseDown(true);
  };

  const onMouseUp = () => {
    setMouseDown(false);
  };

  const onTouchStart = () => {
      setTouchEvents(true);
  };

  const _renderNoteLabel = ({midiNumber, isActive, isAccidental }) => {

  };
  const renderNoteLabel = ({ midiNumber, isActive, isAccidental }) => {
    return (<div className = {
          classNames('ReactPiano__NoteLabel', 
            {
              'ReactPiano__NoteLabel--active': isActive,
              'ReactPiano__NoteLabel--accidental': isAccidental,
              'ReactPiano__NoteLabel--natural': !isAccidental,
            }
          )}></div>);
  };

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      data-testid="container"
    >
      <Keyboard
        noteRange={props.noteRange}
        onPlayNoteInput={onPlayNoteInput}
        onStopNoteInput={onStopNoteInput}
        activeNotes={props.activeNotes}
        className={props.className}
        disabled={props.disabled}
        width={props.width}
        keyWidthToHeight={props.keyWidthToHeight}
        gliss={isMouseDown}
        useTouchEvents={useTouchEvents}
        renderNoteLabel={renderNoteLabel}
      />
    </div>
  );
}

export default ControlledPiano;
