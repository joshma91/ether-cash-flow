import React from 'react'
import { Grid } from "semantic-ui-react";
import web3 from "../web3"
import { formatNumber } from "../utils"

export default class SummaryInfo extends React.Component {
  
  render (){
    const {totalWeiTransferred} = this.props
    return (

      <Grid columns={2} divided>
        <Grid.Row>
          <Grid.Column>Total ETH Transferred: {formatNumber(web3.utils.fromWei(totalWeiTransferred))} </Grid.Column>
          <Grid.Column>Trust Paid: ETH</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>Percent/Payment: %</Grid.Column>
          <Grid.Column>Beneficiary:</Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}