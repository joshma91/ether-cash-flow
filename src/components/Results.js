import React from "react";
import { Table, Loader } from "semantic-ui-react";
import web3 from "../web3";
import { formatNumber } from "../utils"

export default class Results extends React.Component {
  render() {

    const { totals, addressesIsContract } = this.props;
    const addresses = Object.keys(totals).filter(addr => addr !== 'null')
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
                    <Table.Cell>{addr}</Table.Cell>
                    <Table.Cell>
                      {formatNumber(web3.utils.fromWei(totals[addr]))}
                    </Table.Cell>
                    <Table.Cell>
                      {addressesIsContract[addr] ? `YES` : `NO`}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Loader style={{ marginTop: "50px" }} active />
            )}
          </Table.Body>
        </Table>
      </div>
    );
  }
}
