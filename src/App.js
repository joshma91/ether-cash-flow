import React, { Component } from "react";
import {
  Container, Header, Divider, Segment, Button, Grid, Form, Input, Tab, Radio
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { getBlockData } from "./utils";
import web3 from "./getWeb3";
import FixedMenu from "./components/FixedMenu";
import Results from "./components/Results";
import SummaryInfo from "./components/SummaryInfo";
import "./App.css";

class App extends Component {
  state = {
    accounts: null,
    contract: null,
    radio: "range",
    start: "",
    end: "",
    diff: "",
    res: null,
    loading: false
  };
  handleRadioChange = (e, { value }) => this.setState({ radio: value });
  handleChangeStart = e => this.setState({ start: e.target.value });
  handleChangeEnd = e => this.setState({ end: e.target.value });
  handleChangeDiff = e => this.setState({ diff: e.target.value });

  renderForm = () => {
    const { radio, start, end, diff, loading } = this.state;
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
          <Button loading={loading} onClick={this.getDataRange}>
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
          <Button loading={loading} onClick={this.getDataDiff}>
            Query the Blockchain!
          </Button>
        </div>
      );
    }
  };

  getDataDiff = async () => {
    this.setState({ loading: true }, async () => {
      const { diff } = this.state;

      const currentBlock = await web3.eth.getBlockNumber();
      const startBlock = currentBlock - parseInt(diff);
      const res = await getBlockData(startBlock, currentBlock);
      this.setState({ res, loading: false });
    });
  };

  getDataRange = async () => {
    this.setState({ loading: true }, async () => {
      const { start, end } = this.state;
      const res = await getBlockData(parseInt(start), parseInt(end));
      this.setState({ res, loading: false });
    });
  };

  render() {
    const { radio, start, end, diff, res} = this.state;
    const panes = [
      {
        menuItem: "ETH Received by Address",
        render: () => (
          <Tab.Pane attached={true}>
            {res ? (
              <Results
                totals={res.receiverTotals}
                addressesIsContract={res.addressesIsContract}
              />
            ) : (
              `Please run a query!`
            )}
          </Tab.Pane>
        )
      },
      {
        menuItem: "ETH Sent by Address",
        render: () => (
          <Tab.Pane attached={true}>
            {res ? (
              <Results
                totals={res.senderTotals}
                addressesIsContract={res.addressesIsContract}
              />
            ) : (
              `Please run a query!`
            )}
          </Tab.Pane>
        )
      }
    ];

    return (
      <div className="App">
        <FixedMenu />

        <Container text style={{ marginTop: "7em" }}>
          <Header as="h4" attached="top" block>
            1. Query the Blockchain
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
            2. Blockchain Information
          </Header>
          <Segment attached>
            {res ? (
              <SummaryInfo totalWeiTransferred={res.totalWeiTransferred} />
            ) : (
              `Please run a query!`
            )}
          </Segment>
          <Divider section={false} hidden />

          <Tab menu={{ attached: true }} panes={panes} />
        </Container>
      </div>
    );
  }
}

export default App;
