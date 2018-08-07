// if (process.env.NODE_ENV !== 'development') {
//     __webpack_public_path__ = window["__webpack_public_path__"];
// }
require('../../libs/laya.core');
require('../../libs/laya.wxmini');
require('../../libs/laya.webgl');
require('../../libs/laya.ui.js')


let { Browser, WebGL, Stage, Sprite, Handler, Stat, Tween, Ease, Util, Dialog, Image, Button, List, HSlider, Tab } = Laya
Laya.MiniAdpter.init();

const Bwidth = Browser.clientWidth * Browser.pixelRatio
const Bheight = Browser.clientHeight * Browser.pixelRatio
/**
 * 计算出宽度与设计稿的缩放值
 * @param num 
 */
export const SW = (num) => {
    return num * Bwidth / 750
}
/**
 * 计算出高度与设计稿的缩放值
 * @param num 
 */
export const SH = (num) => {
    return num * Bheight / 1206
}

class Item extends Laya.Sprite {
    public static WID: number = SW(336)
    public static HEI: number = SH(151)
    private img: Laya.Image
    private sp: Laya.Sprite

    constructor() {
        super()
        this.size(Item.WID, Item.HEI)
        this.img = new Laya.Image()
        this.img.name = 'img'
        this.addChild(this.img)
        this.sp = new Sprite()
        this.sp.graphics.drawRect(0, 0, SW(100), SH(100), '#000000')
        this.sp.size(SW(100), SH(100))
        this.sp.name = 'rect'
        this.sp.zOrder = 10000;
        this.addChild(this.sp)
        this['rectLeft'] = SW(100)
    }
    public setImg(src: string): void {
        this.img.skin = src
    }
    public setScale(scaleRadio: number, scaleRadioY: number): void {
        this.scale(scaleRadio, scaleRadioY)
    }
    public bindEvent(fun, name) {
        this[name].offAll(Laya.Event.CLICK)
        this[name].once(Laya.Event.CLICK, this, fun)
    }
}
class Game {
    r = Bwidth / 750
    rh = Bheight / 1206
    distanceGap: number = 0
    stage
    road
    bgImage: string = require('../../images/bg-game.png')
    roadImage: string = require('../../images/road.png')
    popImage: string = require('../../images/result-pop-bg.png')
    closeImage: string = require('../../images/btn-close.png')
    /**豆娃四条道路的位置*/
    carPos: Array<{ beginPos: point, endPos: point }> = []
    /**计分板文字 */
    distanceText: Laya.Text;
    /**道路对象 */
    routes: Array<{
        equation: Function,
        radio: number
    }> = []
    /**车 */
    car: Laya.Animation = null
    /**障碍物随机数池 */
    randomHitArr: Array<number> = [0, 1, 2, 3]

    /**车的关键帧 */
    carArr: Array<string> = [
        require('./../../images/back_1.png'),
        require('./../../images/back_2.png'),
        require('./../../images/back_3.png'),
        require('./../../images/back_4.png'),
        require('./../../images/back_5.png'),
        require('./../../images/back_6.png'),
    ]
    /**障碍物图片 */
    viewsArr: Array<string> = [
        require('../../images/view_1.png'),
        require('../../images/view_2.png'),
        require('../../images/view_3.png'),
        require('../../images/view_4.png'),
        require('../../images/view_5.png'),
        require('../../images/view_6.png'),
    ]
    /**当前分数 */
    distance: number = 0
    /**障碍物图片 */
    hitArr: Array<{
        path: string,
        begin: number,
        beginPosRadio: number
    } | Array<{
        path: string,
        begin: number,
        beginPosRadio: number
    }>> = [
            { path: require('./../../images/hit1.png'), begin: 1, beginPosRadio: 1 / 6 },
            { path: require('./../../images/hit2.png'), begin: 0, beginPosRadio: 1 / 6 },
            [
                { path: require('./../../images/hit3-1.png'), begin: 0, beginPosRadio: 1.04 / 4 },
                { path: require('./../../images/hit3-2.png'), begin: 3, beginPosRadio: 0.94 / 2 },
            ],
            [
                { path: require('./../../images/hit4-1.png'), begin: 0, beginPosRadio: 0.98 / 2 },
                { path: require('./../../images/hit4-2.png'), begin: 2, beginPosRadio: 0.94 / 4 },
            ]
        ]
    /**当前车处于哪条轨道 */
    curCarPos: number = 2
    /**当前景物的zOrder */
    zOrder: number = 50000;

    /**当前处于跑道中的障碍物 */
    curMoveArr: Array<Laya.Sprite> = []

    /**渲染间隔 */
    standerGap: number = 10
    /**当前速度 */
    speed: number = 1
    /**初始速度 */
    initialSpeed: number = 1
    /**距离与对应速度 */
    mapDistanceToSpeed: object = {
        '0,300': this.speedRate(1),
        '300,500': this.speedRate(1.2),
        '500,800': this.speedRate(1.4),
        '800,1100': this.speedRate(1.6),
        '1100,1400': this.speedRate(1.8),
        '1400,1700': this.speedRate(2),
        '1700,2000': this.speedRate(2.2),
        '2000,2300': this.speedRate(2.4),
        '2300,2600': this.speedRate(2.6),
        '2600,2900': this.speedRate(2.8),
        '2900,3200': this.speedRate(3),
        '3200,3600': this.speedRate(3.2),
        '3600,3900': this.speedRate(6.4),
    }
    gap: number = 13000
    initialGap = 13000
    mapDisntanceToGap: object = {
        '0,300': this.gapRate(1.5),
        '300,500': this.gapRate(1.4),
        '500,800': this.gapRate(1.3),
        '800,1100': this.gapRate(1.2),
        '1100,1400': this.gapRate(1.1),
        '1400,1700': this.gapRate(1),
        '1700,2000': this.gapRate(1),
        '2000,2300': this.gapRate(.9),
        '2300,2600': this.gapRate(.9),
        '2600,2900': this.gapRate(.8),
        '2900,3200': this.gapRate(.8),
        '3200,3600': this.gapRate(.7),
        '3600,3900': this.gapRate(.6),
    }
    /**上次随机出的随机数 */
    curRandomHitArr: Array<number> = [0, 1, 2, 3]
    isGameOver = false
    /**距离计分板背景图 */
    distanceImage: string = require('../../images/bg-distance.png')
    UILayer;
    buttonImage: string = require('../../images/button.png')
    tabImage: string = require('../../images/tab.png')
    constructor() {
        this.init()
    }
    async init() {
        //初始化微信小游戏
        this.initStage();
        await this.loadImage()
        this.initUILayer()
        this.drawBg()
        this.drawButton('列表')
        this.drawRoad()
        this.getRoute()
        this.drawDistance()
        // this.drawTab()
        // return
        this.gameBegin()

        this.stage.off(Laya.Event.MOUSE_DOWN, this, this.mouseDown)
        this.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown)
        Stat.show();
    }
    initStage() {
        Config.isAlpha = true;

        Laya.init(Bwidth, Bheight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "fixedwidth";
        Laya.stage.bgColor = '';
        Laya.stage.alpha = 1
        this.stage = Laya.stage
    }
    drawTab() {
        let tab = new Tab()
        tab.skin = this.tabImage

        tab.labelSize = SW(20)
        tab.labels = '1,2,3'
        tab.labelColors = '#f75555,#000000'
        tab.labelPadding = '-5,0,0,0'
        tab.space = SW(20)

        tab.selectedIndex = 0
        tab.stateNum = 2
        tab.scale(this.r, this.rh)
        tab.pos(SW(120), SH(200))
        tab.selectHandler = new Handler(this, (index) => {
            console.log(index)
        })
        this.stage.addChild(tab)
    }
    drawButton(txt) {
        let button = new Button(this.buttonImage)
        button.scale(this.r, this.rh)
        button.stateNum = 1
        button.label = txt
        button.labelSize = SW(20)
        button.labelColors = '#000000'
        button.pos(Bwidth / 6 * 4.5, SW(48))
        this.UILayer.addChild(button)
        let list: Laya.List;
        button.clickHandler = Handler.create(this, () => {
            if (button.label != '关闭') {
                list = this.showList()
                button.label = '关闭'
            } else {
                list.destroy()
                button.label = '列表'
            }
        }, null, false)
    }
    showList() {
        console.log('showlist')
        let list = new List()

        list.itemRender = Item
        list.repeatX = 1
        list.repeatY = 6

        list.x = (this.stage.width - Item.WID) / 2
        list.y = (this.stage.height - Item.HEI * list.repeatY) / 2

        list.vScrollBarSkin = ''
        list.selectEnable = true
        const render = (cell, index) => {
            cell.setImg(cell.dataSource.img)
            cell.setScale(cell.dataSource.scale, cell.dataSource.scale)
            cell.bindEvent(() => {
                console.log('da')
                list.changeItem(index, { img: this.distanceImage, scale: 1.6 })
            }, 'img')
            cell.bindEvent(() => {
                console.log('smal')
                list.changeItem(index, { img: this.distanceImage, scale: 1 })
                // list.tweenTo(10, 2000)
                // let data = []
                // for (let i = 0; i < 4; i++) {
                //     data.push({ img: this.distanceImage, scale: 1 })
                // }
                // list.array = data
            }, 'sp')
        }
        list.renderHandler = new Handler(this, render)

        let data = []
        for (let i = 0; i < 12; i++) {
            data.push({ img: this.distanceImage, scale: 1 })
        }
        list.array = data
        list.zOrder = 100000
        this.stage.addChild(list)
        return list

    }

    initUILayer() {
        let UILayer = new Sprite()
        this.UILayer = UILayer
        this.stage.addChild(this.UILayer)
    }
    /**监听用户手势 */
    mouseDown() {
        let originMouse = this.stage.mouseX

        let mouseUp = () => {
            if (this.isGameOver) return
            this.stage.off(Laya.Event.MOUSE_UP, this, mouseUp)

            let curMouse = this.stage.mouseX;
            let lastPos = this.curCarPos;
            if (curMouse - originMouse > SW(20)) {
                // 向右滑
                this.curCarPos < (this.carPos.length - 1) && this.curCarPos++
            } else if (curMouse - originMouse < SW(20)) {
                // 向左滑
                this.curCarPos > 0 && this.curCarPos--
            } else {
                return
            }
            this.turnCarPos(this.curCarPos)
        }
        this.stage.on(Laya.Event.MOUSE_UP, this, mouseUp)
    }
    turnCarPos(dest) {
        let curX = this.carPos[dest].endPos.x
        this.car.pos(curX, this.car.y)
    }
    gameBegin() {
        this.drawCar();
        this.setCarPos();
        this.createViews();
        this.gameRun()
    }
    gameRun() {
        let init = 0
        let initTime = 0
        let initAdTime = 0
        let initHitTime = 0
        let initViewTime = 0
        let lastHitGap = 0;
        let lastViewGap = 0;
        let lastAdGap = 0;
        let point2Y = SH(1206 - 324);
        /**游戏主循环体 */
        const move = (time) => {

            if (!initTime) {
                init = time;
                initTime = time
                initAdTime = time
                initHitTime = time
                initViewTime = time
            }
            let gap = time - initTime
            let adGap = time - initAdTime
            let hitGap = time - initHitTime
            let viewGap = time - initViewTime
            if (gap > this.standerGap) {
                let curTime = time - init;
                let speedRate = 1 / this.standerGap * gap
                for (let n in this.curMoveArr) {
                    let cur = this.curMoveArr[n]
                    initTime = time;
                    let speed = cur.speed * this.speed
                    cur.y += (speedRate * speed);
                    cur.scaleX += (cur.radio * this.r * speedRate) * speed
                    cur.scaleY += (cur.radio * this.rh * speedRate) * speed
                    if (cur.equation) {
                        cur.x = cur.equation(cur.y)
                    } else {
                        cur.x = this.routes[cur.routeIndex].equation(cur.y)
                    }
                    if (cur.y >= point2Y) {
                        cur.speed += 0.1 * speedRate * this.rh
                    } else {
                        cur.speed += 0.02 * speedRate * this.rh
                    }

                    /* 广告图提前消失 */
                    if (cur.type == 'ads') {
                        if (cur.y > Bheight * .65) {
                            cur.visible = false;
                        }
                    }
                    /* 移除元素 */
                    if (cur.y > Bheight + (1000 * this.rh)) {
                        this.curMoveArr.splice(Number(n), 1)
                        // cur.removeSelf()
                        this.stage.removeChild(cur)
                        continue
                    }
                    let curPos = cur.getBounds();
                    let carPos = this.car.getBounds();

                    const isHit = (curPos, carPos, ignore?) => {
                        return cur.type == 'hit' && !ignore && (curPos.y) < (carPos.y + carPos.height) && curPos.intersects(carPos)
                    }
                    if (isHit(curPos, carPos, cur.ignore)) {
                        this.isGameOver = true;
                        this.showPop()
                    }

                    this.setDistance(speedRate)
                }
            }

            if (!lastViewGap) {
                lastViewGap = (6000 + this.getRandomTime(5000)) / this.speed / SH(10) * this.rh;
            }
            if (viewGap > lastViewGap) {
                initViewTime = time;
                lastViewGap = (5000 + this.getRandomTime(5000)) / this.speed / SH(10) * this.rh;
                this.appendViews(0);
                this.appendViews(1);
                setTimeout(e => {
                    this.appendViews(0);
                    this.appendViews(1);
                }, 300)
            }

            if (!lastHitGap) {
                lastHitGap = (this.gap + this.getRandomTime(3000)) / SH(10) * this.rh;
            }
            if (hitGap > lastHitGap) {
                lastHitGap = (this.gap + this.getRandomTime(3000)) / SH(10) * this.rh;
                initHitTime = time;
                this.appendHit();
            }

            if (!lastAdGap) {
                lastAdGap = (15000 + this.getRandomTime(30000)) / this.speed / SH(10) * this.rh;
            }
            // if (adGap > lastAdGap) {
            //     lastAdGap = (15000 + this.getRandomTime(10000)) / this.speed / SH(10) * this.rh;
            //     initAdTime = time;
            //     this.appendAd();
            // }
            if (!this.isGameOver) {
                requestAnimationFrame(move)
            }
        }
        requestAnimationFrame(move)
    }
    showPop() {
        UIConfig.closeDialogOnSide = false
        UIConfig.popupBgAlpha = 0.8

        let pop: Laya.Dialog = new Dialog()
        let bg: Laya.Image = new Image(this.popImage)

        /* 写上第几名 */
        let txt = new Laya.Text()
        txt.bold = true
        txt.align = 'center'
        txt.width = 667
        txt.fontSize = 60
        txt.color = '#ffffff'
        txt.text = '第n名'
        txt.pos(0, 190)
        bg.addChild(txt)

        /* 写上跑了几米 */
        let txt2 = new Laya.Text()
        txt2.bold = true
        txt2.align = 'center'
        txt2.width = 667
        txt2.fontSize = 60
        txt2.color = '#999999'
        txt2.text = this.distance.toFixed(0) + 'm'
        txt2.pos(0, 290)
        bg.addChild(txt2)

        bg.scale(this.r, this.rh)
        pop.addChild(bg)

        let close = new Button(this.closeImage)
        close.name = Dialog.CLOSE
        close.scale(this.rh, this.rh)
        close.stateNum = 1;
        pop.addChild(close)

        pop.popup()
        pop.zOrder = 160000

    }
    /**生成景物 */
    createViews() {
        this.appendViews(0)
        this.appendViews(1)
    }
    /**渲染分数 */
    setDistance(rate) {
        //TODO:100米出现一次logo 
        this.distance += (0.01 * rate * this.speed)
        this.distanceText.text = `${Math.floor(this.distance)}m`
        for (let n in this.mapDistanceToSpeed) {
            let begin = parseFloat(n.split(',')[0])
            let end = parseFloat(n.split(',')[1])
            if (end) {
                /* 有区间 */
                if (this.distance >= begin && this.distance < end) {
                    this.speed = this.mapDistanceToSpeed[n]
                    this.gap = this.mapDisntanceToGap[n]
                    break
                }
            } else {
                /* 没有区间只有最小值 */
                if (this.distance > begin) {
                    this.speed = this.mapDistanceToSpeed[n]
                    this.gap = this.mapDisntanceToGap[n]
                    break
                }
            }
        }
    }
    /**初始化计分板 */
    drawDistance() {
        let d = new Sprite()
        let t = Laya.loader.getRes(this.distanceImage)
        d.graphics.drawTexture(t, 0, 0)
        d.scale(this.r, this.rh)
        d.pos(SW(242), SH(11));
        d.cacheAsBitmap = true
        d.zOrder = 150000;
        this.stage.addChild(d)

        let text: Laya.Text = new Laya.Text()

        text.color = '#ffffff'
        text.align = 'center'
        text.fontSize = SW(32)
        text.width = SW(170)
        text.pos(SW(338), SH(41))
        text.zOrder = 150001;
        this.stage.addChild(text)
        text.text = '0m'
        this.distanceText = text
    }
    /**增加两边树木石头 */
    appendViews(isLeft) {
        --this.zOrder;
        let randomIndex = this.getRandomTime(this.viewsArr.length / 2);
        let index = isLeft ? randomIndex : randomIndex + this.viewsArr.length / 2;
        // let view = this.pool.view[index].pop();
        let view = this.viewFactory(index, isLeft);
        view.visible = true;
        view.zOrder = this.zOrder;
        this.curMoveArr.push(view)
    }
    /**景物精灵工厂 */
    viewFactory(index, isLeft) {
        let left;
        if (isLeft) {
            left = (Math.random() * SW(300 - 119)) + SW(119)
        } else {
            left = (Math.random() * SW(587 - 454)) + SW(454)
        }

        let viewImg: string = this.viewsArr[index];

        let view = new Sprite();
        let curZorder = this.zOrder;
        view.zOrder = curZorder;
        this.zOrder--;
        let t = Laya.loader.getRes(viewImg)
        view.graphics.drawTexture(t, 0, 0)
        view.pivot(0, view.getBounds().height)
        this.UILayer.addChild(view)
        view.scale(this.r, this.rh)

        let beginPos: point = { x: left, y: SH(1206 - 888) }
        // let endPos: point = { x: isLeft ? left - SW(165) : left + SW(165), y: SH(1206 - 731) }
        let endPos: point = { x: isLeft ? left - SW(265) : left + SW(265), y: SH(1206 - 731) }
        //begin
        view.scale(.1 * this.r, .1 * this.rh)
        view.pos(beginPos.x, beginPos.y)
        //end
        // view.scale(.6 * this.r, .6 * this.rh)
        // view.pos(left - SW(160), SH(1206 - 731))

        view.routeIndex = 0
        view.speed = 1
        view.radio = this.getScaleR(
            .4,
            beginPos,
            endPos
        )
        view.equation = this.routeFactory(beginPos, endPos)
        view.isLeft = isLeft;
        view.type = 'view'
        view.index = index;
        view.originPos = beginPos
        view.originScale = { x: view.scaleX, y: view.scaleY }
        view.originSpeed = view.speed
        view.cacheAsBitmap = true;
        view.visible = false
        return view;
    }
    /**增加障碍 */
    appendHit(index?) {
        let randomIndex = this.getRandomHit()
        let cur = this.hitFactory(randomIndex)
        for (let n in cur) {
            cur[n].visible = true;
            this.curMoveArr.push(cur[n])
        }
    }
    hitFactory(index, flag?) {
        let hitData: Array<object> | Object = this.hitArr[index];
        let res = []
        if (!Array.isArray(this.hitArr[index])) {
            hitData = [hitData]
            flag = null
        }
        for (let n in hitData) {
            let hit = new Sprite();

            let cur = hitData[n]
            let t = Laya.loader.getRes(cur.path)
            let carPosIndex = cur.begin
            hit.graphics.drawTexture(t, 0, 0)
            this.stage.addChild(hit)
            hit.pivot(hit.getBounds().width * cur.beginPosRadio, 0)
            hit.scale(this.r, this.rh)

            //begin
            hit.scale(.1 * this.r, .1 * this.rh)
            hit.pos(this.carPos[carPosIndex].beginPos.x, this.carPos[carPosIndex].beginPos.y)
            //end
            // hit.scale(1.75 * this.r, 1.75 * this.rh)
            // hit.pos(this.carPos[carPosIndex].endPos.x, this.carPos[carPosIndex].endPos.y)

            hit.routeIndex = carPosIndex
            hit.speed = 1
            hit.radio = this.getScaleR(
                1.75 - 0.1,
                this.carPos[carPosIndex].beginPos,
                this.carPos[carPosIndex].endPos
            )
            hit.originPos = this.carPos[carPosIndex].beginPos
            hit.originScale = { x: .1 * this.r, y: .1 * this.rh }
            hit.originSpeed = hit.speed
            hit.type = 'hit'
            hit.index = index;
            hit.flag = flag;
            hit.cacheAsBitmap = true;
            hit.visible = false;
            hit.safe = index == 0 ? 0 : index == 1 ? 3 : index == 2 ? 2 : index == 3 ? 1 : 0
            res.push(hit);
            // hit.visible = false
        }
        return res;
    }
    /**获取不重复的随机值 */
    getRandomHit() {
        if (this.curRandomHitArr.length <= 0) {
            this.curRandomHitArr = [...this.randomHitArr]
        }
        let index = Math.round(Math.random() * (this.curRandomHitArr.length - 1))
        return this.curRandomHitArr.splice(index, 1)[0]
    }
    drawCar() {
        if (this.car) {
            this.stage.removeChild(this.car);
            this.car = null;
        }
        let ani = this.setCarAnimation(0);
        let curBounds = ani.getBounds();
        // 设置碰撞区域
        let bounds = new Sprite()
        bounds.graphics.drawRect(0, 0, curBounds.width * 0.1, curBounds.height / 3 * 0.8, "#000000")
        bounds.pos(curBounds.width * 0.4, curBounds.height / 3 * 1.93)

        bounds.zOrder = 11;

        ani.setBounds(bounds.getBounds())

        ani.pivot(curBounds.width / 2, curBounds.height / 1.6);
        ani.scale(this.r, this.r);

        this.car = ani

        ani.zOrder = 10
        this.stage.addChild(ani)
    }
    /**设置车当前的动画状态 */
    setCarAnimation(direc): Laya.Animation {
        let ani = this.car;
        if (!ani) {
            ani = new Laya.Animation()
        }
        ani.interval = 150;
        let frames = this.carArr;
        ani.loadImages(frames);
        ani.play(0, true);
        return ani;
    }
    /**渲染车的位置 */
    setCarPos() {
        this.curCarPos = this.getRandomTime(3);
        this.car.pos(
            this.carPos[this.curCarPos].endPos.x,
            this.carPos[this.curCarPos].endPos.y
        )
    }
    loadImage() {
        let hitPathArr: Array<string> = [];
        for (let n in this.hitArr) {
            let el = this.hitArr[n]
            if (!Array.isArray(el)) {
                hitPathArr.push(el.path)
            } else {
                let i = el.map(el2 => {
                    return el2.path
                })
                hitPathArr.push(...i)
            }
        }
        return new Promise(res => {
            Laya.loader.load([this.bgImage, this.roadImage, this.popImage, this.closeImage, this.buttonImage, this.tabImage]
                .concat(this.carArr)
                .concat(this.viewsArr)
                .concat(hitPathArr)
                .concat(this.distanceImage)
                , Handler.create(this, res))
        })
    }
    gapRate(rate) {
        return this.initialGap * rate;
    }
    /**初始化背景图 */
    drawBg() {
        let bg = new Sprite();
        let t = Laya.loader.getRes(this.bgImage)
        bg.graphics.drawTexture(t, 0, 0)
        bg.scale(Bwidth / bg.getBounds().width, Bheight / bg.getBounds().height)
        bg.cacheAsBitmap = true;
        this.UILayer.addChild(bg)
    }
    drawRoad() {
        let road = new Sprite();
        let t = Laya.loader.getRes(this.roadImage)
        road.graphics.drawTexture(t, 0, 0)
        road.pivot(road.getBounds().width / 2, road.getBounds().height)
        road.scale(this.r, this.rh)
        road.pos(Bwidth / 2, Bheight)
        this.road = road
        this.stage.addChild(road)
    }

    getRoute() {
        let point1Y = this.road.getBounds().y;
        let point2Y = SH(1206 - 324);
        const route = [
            {
                start: {
                    x: SW(352),
                    y: point1Y
                },
                end: {
                    x: SW(70),
                    y: point2Y
                }
            },
            {
                start: {
                    x: SW(364),
                    y: point1Y
                },
                end: {
                    x: SW(270),
                    y: point2Y
                }
            },
            {
                start: {
                    x: SW(378),
                    y: point1Y
                },
                end: {
                    x: SW(478),
                    y: point2Y
                }
            },
            {
                start: {
                    x: SW(390),
                    y: point1Y
                },
                end: {
                    x: SW(680),
                    y: point2Y
                }
            }
        ]
        route.map(el => {
            let dot1 = new Sprite();
            dot1.graphics.drawCircle(0, 0, 0, "#000000");
            dot1.pos(el.start.x, el.start.y)

            let dot2 = new Sprite();
            dot2.graphics.drawCircle(0, 0, 0, "#000000");
            dot2.pos(el.end.x, el.end.y)

            this.stage.addChild(dot1)
            this.stage.addChild(dot2)

            let curPos = {
                beginPos: { x: el.start.x, y: el.start.y },
                endPos: { x: el.end.x, y: el.end.y }
            }

            this.carPos.push(curPos)

            let route = this.routeFactory(
                curPos.beginPos,
                curPos.endPos
            )
            let radio = this.getScaleR(
                0.9,
                curPos.beginPos,
                curPos.endPos
            )
            this.routes.push({ equation: route, radio })
        })

    }

    /**道路对象构造函数 */
    routeFactory(point1: point, point2: point) {
        return y => {
            return (y * (point1.x - point2.x) - point2.y * point1.x + point2.x * point1.y) / (point1.y - point2.y)
        }
    }
    /**获得两点间缩放比例 */
    getScaleR(scaleFix: number, beginPos: point, endPos: point) {
        // return scaleFix / Math.sqrt(Math.pow(beginPos.x - endPos.x, 2) + Math.pow(beginPos.y - endPos.y, 2))
        return scaleFix / Math.abs(beginPos.y - endPos.y)
    }

    /**随机一个[0-num]的值 */
    getRandomTime(num) {
        let time = Math.floor(Math.random() * (num));
        return time;
    }

    /**根据比率计算速度 */
    speedRate(rate) {
        return this.initialSpeed * rate;
    }
}
export default new Game();