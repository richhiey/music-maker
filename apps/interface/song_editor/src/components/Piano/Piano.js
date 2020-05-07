import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import difference from 'lodash.difference';
import ControlledPiano from './ControlledPiano';
import Keyboard from './Keyboard';

class Piano extends React.Component {
  static propTypes = {
    noteRange: PropTypes.object.isRequired,
    activeNotes: PropTypes.arrayOf(PropTypes.number.isRequired),
    playNote: PropTypes.func.isRequired,
    stopNote: PropTypes.func.isRequired,
    onPlayNoteInput: PropTypes.func,
    onStopNoteInput: PropTypes.func,
    renderNoteLabel: PropTypes.func,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    width: PropTypes.number,
    keyWidthToHeight: PropTypes.number,
    keyboardShortcuts: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        midiNumber: PropTypes.number.isRequired,
      }),
    ),
  };

  state = {
    activeNotes: this.props.activeNotes || [],
  };

  componentDidUpdate(prevProps) {
    // Make activeNotes "controllable" by using internal
    // state by default, but allowing prop overrides.
    if (
      prevProps.activeNotes !== this.props.activeNotes &&
      this.state.activeNotes !== this.props.activeNotes
    ) {
      this.setState({
        activeNotes: this.props.activeNotes || [],
      });
    }
  }

  handlePlayNoteInput = (midiNumber) => {
    this.setState((prevState) => {
      // Need to be handled inside setState in order to set prevActiveNotes without
      // race conditions.
      if (this.props.playNote) {
        this.props.playNote(midiNumber);
      }

      // Don't append note to activeNotes if it's already present
      if (prevState.activeNotes.includes(midiNumber.note.number)) {
        return null;
      }
      return {
        activeNotes: prevState.activeNotes.concat(midiNumber.note.number),
      };
    });
  };

  handleStopNoteInput = (midiNumber) => {
    this.setState((prevState) => {
      // Need to be handled inside setState in order to set prevActiveNotes without
      // race conditions.
      if (this.props.stopNote) {
        this.props.stopNote(midiNumber);
      }
      return {
        activeNotes: prevState.activeNotes.filter((note) => midiNumber.note.number !== note),
      };
    });
  };

  render() {
    return (
      <ControlledPiano
        activeNotes={this.state.activeNotes}
        onPlayNoteInput={this.handlePlayNoteInput}
        onStopNoteInput={this.handleStopNoteInput}
        {...this.props}
      />
    );
  }
}

export default Piano;
