import React from 'react'
import { Grid } from "semantic-ui-react";
import web3 from "../getWeb3"
import { formatNumber } from "../utils"

export default class SummaryInfo extends React.Component {
  
  render (){
    const {res} = this.props
    return (

      <div>
        <strong>Querying blocks {res.start} to {res.end}</strong>
      <Grid style={{marginTop:"8px"}} columns={2} divided>
        <Grid.Row>
          <Grid.Column>Total ETH Transferred: {formatNumber(web3.utils.fromWei(res.totalWeiTransferred))} </Grid.Column>
          <Grid.Column>Contract Transaction %: {res.pctContract.toFixed(1)}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column># of Uncle Blocks: {res.numUncles}</Grid.Column>
          <Grid.Column># of Contracts Created: {res.numContracts}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column># of Addresses Receiving Transactions: {res.numReceivers}</Grid.Column>
          <Grid.Column># of Addresses Sending Transactions: {res.numSenders}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column># of Events Fired: {res.numEvents}</Grid.Column>
        </Grid.Row>
      </Grid>
      </div>
    )
  }
}