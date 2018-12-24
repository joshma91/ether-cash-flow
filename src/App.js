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
import getWeb3 from "./utils/getWeb3";
import FixedMenu from "./components/FixedMenu";

import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    radio: null,
    start: "",
    end: "",
    diff: ""
  };
  handleRadioChange = (e, { value }) => this.setState({ radio: value });

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      console.log(web3);

      this.setState({ web3 });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3`);
      console.error(error);
    }
  };

  renderForm = () => {
    const { radio, start, end, diff } = this.state;
    if (radio === "range") {
      return (
        <div>
          <Input
            type="number"
            placeholder="Start"
            value={start}
            onChange={this.handleChangeInputStart}
          />
          <Input
            type="number"
            placeholder="End"
            value={end}
            onChange={this.handleChangeInputEnd}
          />
        </div>
      );
    } else if (radio === "latest") {
      return (
        <div>
          <Input
            type="number"
            placeholder="# of blocks before"
            value={diff}
            onChange={this.handleChangeInputDiff}
          />
        </div>
      );
    }
  };

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

    if (!this.state.web3) {
      return <div>Loading Web3...</div>;
    }
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
            </Form>
            {this.renderForm()}
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
