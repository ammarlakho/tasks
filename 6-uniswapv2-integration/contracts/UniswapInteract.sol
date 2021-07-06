//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';
import "hardhat/console.sol";

contract UniswapInteract {
    IUniswapV2Factory factoryContract;
    IUniswapV2Router02 routerContract;
    IUniswapV2Pair pairContract;

    constructor(address _router) {
        routerContract = IUniswapV2Router02(_router);
        factoryContract = IUniswapV2Factory(routerContract.factory());
    }
     
    function buyExact(address tokenIn, address tokenOut, uint amountOutB, uint allowedSlippage) public {
        address poolAddress = factoryContract.getPair(tokenIn, tokenOut);
        pairContract = IUniswapV2Pair(poolAddress);
        (uint reserveIn, uint reserveOut, ) = pairContract.getReserves();
        
        uint amountIn = UniswapV2Library.getAmountIn(amountOutB, reserveIn, reserveOut);
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "My: transferFrom failed.");
        require(IERC20(tokenIn).approve(address(routerContract), amountIn), "My: Approve Failed.");
        
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        uint[] memory amounts = routerContract.swapTokensForExactTokens(
                        amountOutB, 
                        amountIn,
                        path, 
                        msg.sender,
                        block.timestamp
                        );
        for(uint i=0; i<amounts.length; i++) {
            console.log(amounts[i]);
        }
    }

    function sellExact(address tokenIn, address tokenOut, uint amountInA, uint allowedSlippage) public {
        address poolAddress = factoryContract.getPair(tokenIn, tokenOut);
        pairContract = IUniswapV2Pair(poolAddress);
        (uint reserveIn, uint reserveOut, ) = pairContract.getReserves();
        
        uint amountOut = UniswapV2Library.getAmountOut(amountInA, reserveIn, reserveOut);
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountInA), "My: transferFrom failed.");
        require(IERC20(tokenIn).approve(address(routerContract), amountInA), "My: Approve Failed.");
        
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        routerContract.swapExactTokensForTokens(
                        amountInA, 
                        amountOut,
                        path, 
                        msg.sender,
                        block.timestamp
        );
    }

    function addLiquidity(address tokenA, address tokenB, uint amountA, uint amountB, uint tolPercentage, uint decimals) public {
        uint factor = 10**(decimals+2); //The +2 is due to percentage.
        uint amountAMin = ((factor - tolPercentage) * amountA) / factor;
        uint amountBMin = ((factor - tolPercentage) * amountB) / factor;

        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "My: transferFrom failed.");
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "My: transferFrom failed.");
        require(IERC20(tokenA).approve(address(routerContract), amountA), "My: Approve Failed.");
        require(IERC20(tokenB).approve(address(routerContract), amountB), "My: Approve Failed.");

        routerContract.addLiquidity(tokenA, tokenB, amountA, amountB, amountAMin, amountBMin, msg.sender, block.timestamp);
    }

    function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint tolPercentage, uint decimals) public {
        uint factor = 10**(decimals+2); //The +2 is due to percentage.
        // uint amountAMin = ((factor - tolPercentage) * amountA) / factor;
        // uint amountBMin = ((factor - tolPercentage) * amountB) / factor;
        uint amountAMin = 0;
        uint amountBMin = 0;
        address poolAddress = factoryContract.getPair(tokenA, tokenB);
        
        require(IUniswapV2Pair(poolAddress).transferFrom(msg.sender, address(this), liquidity), "My: transferFrom failed.");
        require(IUniswapV2Pair(poolAddress).approve(address(routerContract), liquidity), "My: Approve Failed.");

        routerContract.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, msg.sender, block.timestamp);
    }

    function getPoolAddress(address tokenA, address tokenB) public view returns (address) {
        address poolAddress = factoryContract.getPair(tokenA, tokenB);
        return poolAddress;
    }
}