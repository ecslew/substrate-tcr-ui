import React, { Component } from 'react';
import { waitReady } from '@polkadot/wasm-crypto';
import { Row, Col } from 'reactstrap';
import Listings from './components/Listings'
import ApplyPopup from './modals/Apply';
import './App.css';

import * as service from './services/tcrService';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connection: {},
      tcrDetails: {
        minDeposit: "",
        applyStageLen: "",
        commitStageLen: ""
      },
      listings: [],
      modal: false,
      inProgress: false,
      seed: "",
      balance: 0
    };

    this.applyListing = this.applyListing.bind(this);
    this.getBalance = this.getBalance.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    // We are loading the wasm-crypto manually 
    // as it is needed to create keyring from the seed on the app start.
    waitReady().then(() => {
      // localStorage.setItem("listings", JSON.stringify([]));
      const localSeed = localStorage.getItem("seed");
      if (localSeed) {
        this.getBalance(localSeed);
        this.setState({ seed: localSeed });
      }

      service.connect().then((connect) => {
        this.setState({
          connection: connect
        });
      });

      service.getTcrDetails().then((details) => {
        this.setState({
          tcrDetails: {
            minDeposit: details.mdTokens,
            applyStageLen: details.aslSeconds,
            commitStageLen: details.cslSeconds
          }
        });
      });

      this.getAllListings();
    });
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  applyListing(name, deposit) {
    this.setState({ inProgress: true });
    service.applyListing(name, deposit).then((result) => {
      console.log(result);
      this.setState({ inProgress: false });
      this.toggle();
      this.getAllListings();
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.getAllListings();
  }

  handleSeedChange(event) {
    this.setState({ seed: event.target.value });
  }

  saveSeed(event) {
    event.preventDefault();
    localStorage.setItem("seed", this.state.seed);
    this.getBalance();
  }

  getBalance(seed) {
    service.getBalance(seed, (result) => {
      this.setState({ balance: result });
    });
  }

  getAllListings() {
    this.setState({ listings: [] });
    service.getAllListings().then((result) => {
      setTimeout(() => {
        for (const item of result) {
          this.setState({ listings: [...this.state.listings, item] });
        }
      }, 1000);
      this.setState({
        modal: false
      });
    });
  }

  render() {
    return (
      <div>
        <ApplyPopup modal={this.state.modal} submit={this.applyListing} toggle={this.toggle} header={"申请上榜"} inProgress={this.state.inProgress} />
        <div className="container text-center">
          <br />
          <p className="h2">币排行---温哥华2019度八大私房菜</p>
          <br />
          <div className="alert alert-primary text-left">
            <div>
              <div className="alert alert-success">
                排行链: <b>{this.state.connection.chain}</b>; 节点: <b>{this.state.connection.name}</b>; 版本: <b>{this.state.connection.version}</b>
              </div>
              <Row>
                <Col>
                  <p><b>币排行通证经济</b></p>
                  <p>申请保证金（最少PHB): <b>{this.state.tcrDetails.minDeposit}</b></p>
                  <p>申请时长 (秒): <b>{this.state.tcrDetails.applyStageLen}</b></p>
                  <p>投票评选时长 (秒): <b>{this.state.tcrDetails.commitStageLen}</b></p>
                </Col>
                <Col>
                  <p><b>申请时间</b></p>
                  <Row>
                    <Col xs="10">
                      <input type="text" name="seed" id="seed" className="form-control" value={this.state.seed} onChange={this.handleSeedChange.bind(this)} />
                    </Col>
                    <Col xs="2">
                      <button className="btn btn-primary" onClick={this.saveSeed.bind(this)}>保存</button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      余额: <b>{this.state.balance}</b>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
          <br />
          <div className="container text-left">
            <span className="h3">币排行榜单</span>
            <button className="btn btn-secondary float-right" style={{ marginLeft: 10 }} type="button" onClick={this.handleSubmit}>更新榜单</button>
            <button className="btn btn-primary float-right" onClick={this.toggle}>申请上榜</button>
            <br /><br /><br />
            <div className="text-left">
              <Listings list={this.state.listings} />
            </div>
            <br /><br />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
