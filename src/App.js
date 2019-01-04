import React, { Component } from "react";
import {
  Container,
  Header,
  Divider,
  Segment,
  Tab
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { getBlockData } from "./utils";
import web3 from "./getWeb3";
import FixedMenu from "./components/FixedMenu";
import Results from "./components/Results";
import SummaryInfo from "./components/SummaryInfo";
import QueryForm from "./components/QueryForm";
import "./App.css";

class App extends Component {
  state = {
    res: null,
    loading: false
  };

  getDataDiff = async diff => {
    this.setState({ loading: true }, async () => {
      const currentBlock = await web3.eth.getBlockNumber();
      const startBlock = currentBlock - parseInt(diff);
      const res = await getBlockData(startBlock, currentBlock);
      this.setState({ res, loading: false });
    });
  };

  getDataRange = async (start, end) => {
    this.setState({ loading: true }, async () => {
      const res = await getBlockData(parseInt(start), parseInt(end));
      this.setState({ res, loading: false });
    });
  };

  render() {
    const { loading, res } = this.state;
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
            <QueryForm
              loading={loading}
              getDataDiff={this.getDataDiff}
              getDataRange={this.getDataRange}
            />
          </Segment>
          <Divider section />

          <Header as="h4" attached="top" block>
            2. Blockchain Information
          </Header>
          <Segment attached>
            {res ? (
              <SummaryInfo res={res} />
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
