import React, { Component } from 'react';

export default class Counter extends Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return <p>残り{this.props.count}回</p>;
  }
}
