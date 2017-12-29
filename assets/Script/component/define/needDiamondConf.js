var MODE_DIAMOND_HOST = 1              //房主扣钻
var MODE_DIAMOND_EVERY = 2             //每人扣钻
var MODE_DIAMOND_WIN = 3               //大赢家扣钻

var needDiamondConf = {
	"zhajinhua" : {
		"6" : {
			"10" : {
				"1" : 5,
				"2" : 1,
				"3" : 5,
				"agency" : 5
			},
			"20" : {
				"1" : 10,
				"2" : 2,
				"3" : 10,
				"agency" : 10
			}
		},
		"9" : {
			"10" : {
				"1" : 10,
				"2" : 2,
				"3" : 10,
				"agency" : 10
			},
			"15" : {
				"1" : 15,
				"2" : 3,
				"3" : 15,
				"agency" : 15
			}
		},
		"12" : {
			"10" : {
				"1" : 10,
				"2" : 2,
				"3" : 10,
				"agency" : 10
			},
			"20" : {
				"1" : 20,
				"2" : 4,
				"3" : 20,
				"agency" : 20
			}
		}
	},
	"niuniu" : {
		"6" : {
			"10" : {
				"1" : 5,
				"2" : 1,
				"3" : 5,
				"agency" : 5
			},
			"20" : {
				"1" : 10,
				"2" : 2,
				"3" : 10,
				"agency" : 10
			}
		},
		"9" : {
			"10" : {
				"1" : 7,
				"2" : 2,
				"3" : 7,
				"agency" : 7
			},
			"20" : {
				"1" : 14,
				"2" : 3,
				"3" : 14,
				"agency" : 14				
			}
		},
		"12" : {
			"10" : {
				"1" : 6,
				"2" : 2,
				"3" : 6,
				"agency" : 6
			},
			"20" : {
				"1" : 12,
				"2" : 4,
				"3" : 12,
				"agency" : 12				
			}
		}
	},
	"sanKung" : {
		"6" : {
			"10" : {
				"1" : 3,
				"2" : 1,
				"3" : 3,
				"agency" : 3
			},
			"20" : {
				"1" : 6,
				"2" : 2,
				"3" : 6,
				"agency" : 6
			}
		},
		"9" : {
			"10" : {
				"1" : 6,
				"2" : 2,
				"3" : 6,
				"agency" : 6
			},
			"20" : {
				"1" : 9,
				"2" : 3,
				"3" : 9,
				"agency" : 9				
			}
		},
		"12" : {
			"10" : {
				"1" : 6,
				"2" : 2,
				"3" : 6,
				"agency" : 6
			},
			"20" : {
				"1" : 12,
				"2" : 4,
				"3" : 12,
				"agency" : 12				
			}
		}
	}
}

var handler = module.exports

handler.getNeedDiamond = function(type,playerNumber,consumeMode,gameNumber) {
	var tmpDiamond = false
	if(needDiamondConf[type]){
		if(needDiamondConf[type] && needDiamondConf[type][playerNumber]
		&& needDiamondConf[type][playerNumber][gameNumber] && needDiamondConf[type][playerNumber][gameNumber][consumeMode]){
			tmpDiamond = needDiamondConf[type][playerNumber][gameNumber][consumeMode]
		}
		return tmpDiamond
	}else{
		if(needDiamondConf["niuniu"] && needDiamondConf["niuniu"][playerNumber]
		&& needDiamondConf["niuniu"][playerNumber][gameNumber] && needDiamondConf["niuniu"][playerNumber][gameNumber][consumeMode]){
			tmpDiamond = needDiamondConf["niuniu"][playerNumber][gameNumber][consumeMode]
		}
		return tmpDiamond
	}
}
