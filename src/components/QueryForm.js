import React from "react";
import { Input, Button, Form, Radio } from "semantic-ui-react";

export default class SummaryInfo extends React.Component {
  state = {
    radio: "range",
    start: "",
    end: "",
    diff: ""
  };
  handleRadioChange = (e, { value }) => this.setState({ radio: value });
  handleChangeStart = e => this.setState({ start: e.target.value });
  handleChangeEnd = e => this.setState({ end: e.target.value });
  handleChangeDiff = e => this.setState({ diff: e.target.value });

  renderInput = () => {
    const { start, end, diff, radio } = this.state;
    if (radio === "range") {
      return (
        <div>
          <Input
            type="number"
            placeholder="Start block"
            value={start}
            onChange={this.handleChangeStart}
          />
          <Input
            type="number"
            placeholder="End block"
            value={end}
            onChange={this.handleChangeEnd}
          />
          <Button
            loading={this.props.loading}
            onClick={() => this.props.getDataRange(start, end)}
          >
            Query the Blockchain!
          </Button>
        </div>
      );
    } else if (radio === "latest") {
      return (
        <div>
          <Input
            type="number"
            placeholder="# of blocks before"
            value={diff}
            onChange={this.handleChangeDiff}
          />
          <Button
            loading={this.props.loading}
            onClick={() => this.props.getDataDiff(diff)}
          >
            Query the Blockchain!
          </Button>
        </div>
      );
    }
  };

  render() {
    const { radio } = this.state;

    return (
      <Form>
        <Form.Field>
          <Radio
            label="Block Range (Inclusive)"
            name="radioGroup"
            value="range"
            checked={radio === "range"}
            onChange={this.handleRadioChange}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label="Number of Blocks Before Current Block"
            name="radioGroup"
            value="latest"
            checked={radio === "latest"}
            onChange={this.handleRadioChange}
          />
        </Form.Field>
        {this.renderInput()}
      </Form>
    );
  }
}
