const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
    position : {
        x : 0,
        y : 0
    },
    imageSrc : './samurai_woods/map.png'
})

const shop = new Sprite({
    position : {
        x : 605,
        y : 129
    },
    imageSrc : './samurai_woods/shops.png',
    scale : 2.75,
    framesMax : 6
})

const player = new Fighter({
    position: {
    x : 0,
    y : 0
    },
    velocity: {
        x : 0,
        y : 10
    },
    offset : {
        x : 0,
        y : 0
    },
    imageSrc : './samurai_woods/samuraiMack/Idle.png',
    framesMax : 8,
    scale : 2.5,
    offset : {
        x : 215,
        y : 156
    },
    sprites : {
        idle : {
            imageSrc : './samurai_woods/samuraiMack/Idle.png',
            framesMax : 8
        },
        run : {
            imageSrc : './samurai_woods/samuraiMack/Run.png',
            framesMax : 8
        },
        jump : {
            imageSrc : './samurai_woods/samuraiMack/Jump.png',
            framesMax : 2
        },
        fall : {
            imageSrc : './samurai_woods/samuraiMack/Fall.png',
            framesMax : 2
        },
        attack1 : {
            imageSrc : './samurai_woods/samuraiMack/Attack1.png',
            framesMax : 6
        },
        takeHit : {
            imageSrc : './samurai_woods/samuraiMack/Take hit.png',
            framesMax : 4
        },
        death : {
            imageSrc : './samurai_woods/samuraiMack/Death.png',
            framesMax : 6
        }
    },
    attackBox : {
        offset : {
            x : 100,
            y : 50
        },
        width : 155,
        height : 50
    }
})

const enemy = new Fighter({
    position: {
        x : 970,
        y : 0
    },
    velocity: {
        x : 0,
        y : 0
    },
    color : 'blue',
    offset : {
        x : -50,
        y : 0
    },
    imageSrc : './samurai_woods/kenji/Idle.png',
    framesMax : 4,
    scale : 2.5,
    offset : {
        x : 215,
        y : 171
    },
    sprites : {
        idle : {
            imageSrc : './samurai_woods/kenji/Idle.png',
            framesMax : 4
        },
        run : {
            imageSrc : './samurai_woods/kenji/Run.png',
            framesMax : 8
        },
        jump : {
            imageSrc : './samurai_woods/kenji/Jump.png',
            framesMax : 2
        },
        fall : {
            imageSrc : './samurai_woods/kenji/Fall.png',
            framesMax : 2
        },
        attack1 : {
            imageSrc : './samurai_woods/kenji/Attack1.png',
            framesMax : 4
        },
        takeHit : {
            imageSrc : './samurai_woods/kenji/Take hit.png',
            framesMax : 3
        },
        death : {
            imageSrc : './samurai_woods/kenji/Death.png',
            framesMax : 7
        }
    },
    attackBox : {
        offset : {
            x : -170,
            y : 50
        },
        width : 170,
        height : 50
    }      
})

const keys = {
    a : {
        pressed : false
    },
    d : {
        pressed : false
    },
    w : {
        pressed : false
    },
    ArrowRight : {
        pressed : false
    },
    ArrowLeft : {
        pressed : false
    },
    ArrowUp : {
        pressed : false
    }
}

decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    c.fillStyle = 'rgba(255, 255, 255, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    enemy.update(); 

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // Player
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5;
        player.switchSprite('run');
    }
    else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5;
        player.switchSprite('run');
    }
    else {
        player.switchSprite('idle');
    }

    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    }
    else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }

    // Enemy
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    }
    else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } 
    else {
        enemy.switchSprite('idle');
    }

    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    }
    else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    // Detect collision
    if (
        rectangularCollision ({
            rectangle1 : player, 
            rectangle2 : enemy
        }) &&
        player.isAttacking &&
        player.framesCurrent === 4
    ) {
        enemy.takeHit(20);
        player.isAttacking = false;
        //enemy.health -= 20;
        //document.querySelector('#enemyHealth').style.width = enemy.health + '%';
        gsap.to('#enemyHealth', {
            width : enemy.health + '%'
        })
    }
    // miss
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
    }

    if (
        rectangularCollision ({
            rectangle1 : enemy, 
            rectangle2 : player
        }) &&
        enemy.isAttacking
    ) {
        player.takeHit(10);
        enemy.isAttacking = false;
        //player.health -= 10;
        //document.querySelector('#playerHealth').style.width = player.health + '%';
        gsap.to('#playerHealth', {
            width : player.health + '%'
        })
    }
    // miss
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
    }

    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerid});
    }
}

animate();

window.addEventListener('keydown', (event) => {
    if (player.live) {
        switch (event.key) {
            case 'd' :
                keys.d.pressed = true; 
                player.lastKey = 'd';
                break;
            case 'a' : 
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'w' : 
                if (player.position.y + player.height + player.velocity.y >= canvas.height -95) {
                    player.velocity.y = -20;
                }
                break;
            case ' ' :
                player.attack();
                break;
        }
    }
    if (enemy.live) {
        switch (event.key) {
            case 'ArrowRight' : 
                keys.ArrowRight.pressed = true; 
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft' : 
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp' :  
                if (enemy.position.y + enemy.height + enemy.velocity.y >= canvas.height - 95) {
                    enemy.velocity.y = -20;
                }
                break;
            case 'ArrowDown' :
                enemy.attack();
                break;
        }      
    }  
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd' :
            keys.d.pressed = false; 
            break;
        case 'a' :
            keys.a.pressed = false;
            break;
    }

    switch (event.key) {
        case 'ArrowRight' :
            keys.ArrowRight.pressed = false; 
            break;
        case 'ArrowLeft' :
            keys.ArrowLeft.pressed = false;
            break;
    }
})