'use strict'

module.exports = function GatheringMarkers(mod) {

    const configPath = './config.json';
    let config = null;
    
    let active = true,
    enabled = true,
    markenabled = true,
    messager = false,
    alerts = false,
    Item_ID = 98260,
    whiteList = [],
    markList = [],
    marks = [],
    idMod = 2n;

    let map = new Map()
    map[1] = 'Harmony Grass'
    map[2] = 'Wild Cobseed'
    map[3] = 'Veridia Root'
    map[4] = 'Orange Mushroom'
    map[5] = 'Moongourd'
    map[6] = 'Apple Tree'
    map[101] = 'Plain Stone'
    map[102] = 'Cobala Ore'
    map[103] = 'Shadmetal Ore'
    map[104] = 'Xermetal Ore'
    map[105] = 'Normetal Ore'
    map[106] = 'Galborne Ore'
    map[201] = 'Achromic Essence'
    map[202] = 'Crimson Essence'
    map[203] = 'Earth Essence'
    map[204] = 'Azure Essence'
    map[205] = 'Opal Essence'
    map[206] = 'Obsidian Essence'
    
    mod.hook('S_LOGIN', 10, (event) => {
        getConfigData(configPath);
    })
    
    mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
        if (!enabled || !active) return;
        if (!whiteList.includes(event.id)) return false;

        if (markenabled) {   
            if (markList.includes(event.id) && !marks.includes(event.gameId.toString())) {
                spawnMark(event.gameId*idMod, event.loc);
                marks.push(event.gameId.toString());
            }
        }
        
        if (alerts) notice('Found ' + map[event.id])
        
        if (messager) mod.command.message('Found ' + event.id)
            
    })
        
    mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
        if (marks.includes(event.gameId.toString())) {
            despawnMark(event.gameId*idMod)
            marks.splice(marks.indexOf(event.gameId.toString()), 1);
        }
    })
    
	mod.hook('S_LOAD_TOPO', 3, event => {
        active = event.zone < 9000;
		marks = [];
	})

	function configInit() {
        if (config) {
            ({enabled,markenabled,messager,alerts,Item_ID,whiteList,markList} = config)
        } else {
            mod.command.message("Error: Unable to load config.json - Using default values for now");
        }
    }
    
    function getConfigData(pathToFile) {
		try {
			config = JSON.parse(fs.readFileSync(path.join(__dirname, pathToFile)));
		} catch (e) {
			config = {};
		}
	}

	function spawnMark(idRef, loc) {
        loc.z -= 100;
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: idRef,
			loc: loc,
			item: Item_ID, 
			amount: 1,
			expiry: 300000,
			explode:false,
			masterwork:false,
			enchant:0,
			source:0,
			debug:false,
			owners: [{id: 0}]
		})
	}
	
	function despawnMark(idRef) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: idRef
		});
	}    
    
	function notice(msg) {
		mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
            type: 43,
            chat: false,
            channel: 0,
            message: msg
        })
    }
    
    mod.command.add('gathering', (p1)=> {
        if (p1) p1 = p1.toLowerCase();
        if (p1 == null) {
            enabled = !enabled;
        } else if(p1 === 'reload') {
            getConfigData(configPath)
            mod.command.message('Config reloaded')
        } else if (p1 === 'off') {
            enabled = false;
        } else if (p1 === 'on') {
            enabled = true;
        } else if (['alert', 'alerts'].includes(p1)) {
			alerts = !alerts;
			mod.command.message(alerts ? 'System popup notice enabled' : 'System popup notice disabled');
            return;
        } else if (['message', 'messages', 'proxy'].includes(p1)) {
			messager = !messager;
			mod.command.message(messager ? 'Proxy messages enabled' : 'Proxy messages disabled');
            return;
        } else if (['mark', 'marks', 'marker', 'markers'].includes(p1)) {
			markenabled = !markenabled;
			mod.command.message(markenabled ? 'Item Markers enabled' : 'Item Markers disabled');
            return;
        } else {
            mod.command.message(p1 +' is an invalid argument');
            return;
        }
        mod.command.message(enabled ? 'Enabled' : 'Disabled');
    });

}