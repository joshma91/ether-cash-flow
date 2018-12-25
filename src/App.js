import React, { Component } from "react";
import {
  Container,
  Header,
  Divider,
  Segment,
  Button,
  Grid,
  Form,
  Input,
  Tab,
  Radio
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import * as utils from "./utils"
import web3 from './web3';
import FixedMenu from "./components/FixedMenu";
import "./App.css";

class App extends Component {
  state = {
    accounts: null,
    contract: null,
    radio: "range",
    start: "",
    end: "",
    diff: "",
    res: null
  };
  handleRadioChange = (e, { value }) => this.setState({ radio: value });
  handleChangeStart = e => this.setState({ start: e.target.value });
  handleChangeEnd = e => this.setState({ end: e.target.value });
  handleChangeDiff = e => this.setState({ diff: e.target.value });

  renderForm = () => {
    const { radio, start, end, diff } = this.state;
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
          <Button onClick={this.getDataRange}>Query the Blockchain!</Button>
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
          <Button onClick={this.getDataDiff}>Query the Blockchain!</Button>
        </div>
      );
    }
  };

  getDataDiff = async () => {
    const { diff } = this.state;

    const currentBlock = await web3.eth.getBlockNumber();
    const startBlock = currentBlock - diff;
    const res = await utils.getBlockData(startBlock, currentBlock);
    this.setState({
      res
    });
  };

  getDataRange = async () => {};

  render() {
    const { radio, start, end, diff } = this.state;
    const panes = [
      {
        menuItem: "Administer Trust",
        render: () => <Tab.Pane attached={true}>Yo it's a test</Tab.Pane>
      },
      {
        menuItem: "Payment History",
        render: () => <Tab.Pane attached={true}> Yo it's a test</Tab.Pane>
      }
    ];

    return (
      <div className="App">
        <FixedMenu />

        <Container text style={{ marginTop: "7em" }}>
          <Header as="h4" attached="top" block>
            User Input
          </Header>
          <Segment attached>
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

              {this.renderForm()}
            </Form>
          </Segment>
          <Divider section />

          <Header as="h4" attached="top" block>
            Information
          </Header>
          <Segment attached>
            <Grid columns={2} divided>
              <Grid.Row>
                <Grid.Column>Remaining Trust ETH</Grid.Column>
                <Grid.Column>Trust Paid: ETH</Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>Percent/Payment: %</Grid.Column>
                <Grid.Column>Beneficiary:</Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
          <Divider section />

          <Tab menu={{ attached: true }} panes={panes} />
        </Container>
      </div>
    );
  }
}

export default App;
