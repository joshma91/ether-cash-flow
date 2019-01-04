import React from "react";
import { Table, Loader } from "semantic-ui-react";
import web3 from "../getWeb3";

export default class Results extends React.Component {
  render() {
    const { totals, addressesIsContract } = this.props;
    const addresses = Object.keys(totals).filter(addr => totals[addr] > 0);
    return (
      <div>
        {" "}
        <Table striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Amount (ETH)</Table.HeaderCell>
              <Table.HeaderCell>Contract?</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {addresses.length > 0 ? (
              addresses.map((addr, i) => {
                return (
                  <Table.Row key={i}>
                    <Table.Cell>
                      {addr === "null" ? "Contract Creation" : addr}
                    </Table.Cell>
                    <Table.Cell>
                      {web3.utils.fromWei(totals[addr])}
                    </Table.Cell>
                    <Table.Cell>
                      {addressesIsContract[addr] ? `YES` : `NO`}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              null
            )}
          </Table.Body>
        </Table>
      </div>
    );
  }
}
