// Get funds from users
// withdraw funds
// set a minimum funding value in USD

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// import "hardhat/console.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughFund();
error FundMe__TransferFailed();

/**
 *   @title  A contract for crowd funding
 *   @author Sarathi
 *   @notice This contract is to demo a sample funding contract
 *   @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    // state variable
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender != i_owner,"Sender is not owner!");
        // console.log("onlyOwner");
        // console.log(msg.sender);
        // console.log(i_owner);
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     *   @notice This function funds this contract
     *   @dev This implements price feeds as our library
     */
    function fund() public payable {
        // want to be able to set minimum fund
        // require(getConversionRate(msg.value) >= MINIMUM_USD,"Didn't send Enough"); // 1 * 10^18
        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
            revert FundMe__NotEnoughFund();
        }
        // 1 * 10^18
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // require(msg.sender == owner,"Sender is not owner!");
        // for loop
        // [1 ,2 ,3 ,4]
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // reseting the s_funders array;
        s_funders = new address[](0);

        // withdarw the funds
        // three ways to withdraw , transfer , send , call

        // transfer
        // msg.sender is a address
        // payable(msg.sender) is a payable address
        // payable(msg.sender).transfer(address(this).balance);

        // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess,"Send Failed");

        // call
        (
            bool callSuccess, /*bytes memory dataReturned */

        ) = i_owner.call{value: address(this).balance}("");
        // require(callSuccess, "Call Failed");
        if (!callSuccess) revert FundMe__TransferFailed();
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mapping variable can't be in memory , sorry
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (
            bool callSuccess, /*bytes memory dataReturned */

        ) = i_owner.call{value: address(this).balance}("");
        // require(callSuccess, "Call Failed");
        if (!callSuccess) revert FundMe__TransferFailed();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
