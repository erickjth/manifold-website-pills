import './styles.css';
import Matter from 'matter-js';
import { gsap } from 'gsap';

const Engine = Matter.Engine,
	Runner = Matter.Runner,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	Composite = Matter.Composite,
	Body = Matter.Body,
	Bodies = Matter.Bodies,
	Events = Matter.Events;

function Pills() {
	this.element = document.querySelector('.pt-fallbox');
	this.item = Array.from(this.element.querySelectorAll('.pt-fallbox-item'));
	this.isLg = this.element.classList.contains('-lg');
	this.isXl = this.element.classList.contains('-xl');

	this.createWorld = function () {
		this.height = this.element.offsetHeight;
		this.width = this.element.offsetWidth;
		this.engine = Engine.create({ gravity: { y: 0.8 } });
		this.world = this.engine.world;
		this.runner = Runner.create({ enabled: false });
		this.mouse = Mouse.create(this.element);
		this.element.removeEventListener('mousewheel', this.mouse.mousewheel);
		this.element.addEventListener('mouseleave', this.mouse.mouseup);
		this.mouseConstraint = MouseConstraint.create(this.engine, {
			mouse: this.mouse,
			constraint: { render: { visible: false } },
		});
		Composite.add(this.engine.world, [this.mouseConstraint]);
		Runner.run(this.runner, this.engine);
	};

	this.createWalls = function () {
		this.wallL = Bodies.rectangle(-250, this.height / 2, 500, 4 * this.height, {
			isStatic: true,
		});
		this.wallR = Bodies.rectangle(this.width + 250, this.height / 2, 500, 4 * this.height, {
			isStatic: true,
		});
		this.wallB = Bodies.rectangle(0, this.height + 250, 2 * this.width, 500, {
			isStatic: true,
		});
		Composite.add(this.engine.world, [this.wallB, this.wallL, this.wallR]);
	};

	this.createTopWall = function () {
		this.wallT = Bodies.rectangle(0, -250, 2 * this.width, 500, {
			isStatic: true,
		});
		Composite.add(this.engine.world, [this.wallT]);
	};

	this.startObserver = function () {
		this.observer = new IntersectionObserver(e => {
			this.runner.enabled = e[0].isIntersecting;
		});

		this.observer.observe(this.element);
	};

	this.startUnfoldObserver = function () {
		this.unfoldObserver = new IntersectionObserver(
			e => {
				if (e[0].isIntersecting) {
					this.unfoldBodies();
					this.unfoldObserver.disconnect();
				}
			},
			{ rootMargin: '-50% 0% -35% 0%' }
		);

		this.unfoldObserver.observe(this.element);
	};

	this.refresh = function () {
		if (this.height === this.element.offsetHeight && this.width === this.element.offsetWidth) {
			return false;
		}

		this.height = this.element.offsetHeight;
		this.width = this.element.offsetWidth;

		setTimeout(() => {
			this.updateWalls();
			this.updateBodies();
		});
	};

	this.bindResize = function () {
		this.resizeFn = () => this.refresh();
		window.addEventListener('resize', this.resizeFn);
	};

	this.makeScrollGravity = function () {
		const e = this.isXl ? 0.07 : 0.2;
		let n = 0;
		Events.on(this.runner, 'tick', () => {
			const pageYOffset = window.pageYOffset;
			const r = pageYOffset - n;
			this.engine.world.gravity.y = 0.8 - gsap.utils.clamp(-2, 4, r * e);
			n = pageYOffset;
		});
	};

	this.updateWalls = function () {
		if (this.wallT) {
			Body.setVertices(
				this.wallT,
				Bodies.rectangle(0, -250, 2 * this.width, 500, { isStatic: true }).vertices
			);

			if (this.wallL) {
				Body.setPosition(this.wallL, {
					x: -250,
					y: this.height / 2,
				});
				Body.setVertices(
					this.wallL,
					Bodies.rectangle(-250, this.height / 2, 500, 4 * this.height, {
						isStatic: true,
					}).vertices
				);
			}

			if (this.wallR) {
				Body.setPosition(this.wallR, {
					x: this.width + 250,
					y: this.height / 2,
				});
				Body.setVertices(
					this.wallR,
					Bodies.rectangle(this.width + 250, this.height / 2, 500, 4 * this.height, {
						isStatic: true,
					}).vertices
				);
			}

			if (this.wallB) {
				Body.setPosition(this.wallB, {
					x: 0,
					y: this.height + 250,
				});

				Body.setVertices(
					this.wallB,
					Bodies.rectangle(0, this.height + 250, 2 * this.width, 500, {
						isStatic: true,
					}).vertices
				);
			}
		}
	};

	this.createBodies = function () {
		this.bodies = [];
		this.item.forEach((item, index) => {
			const innerItem = item.querySelector('span');
			const rect = item.getBoundingClientRect();
			const xSetter = gsap.quickSetter(item, 'x', 'px');
			const ySetter = gsap.quickSetter(item, 'y', 'px');

			const angle = gsap.utils.random(0.2 * -Math.PI, 0.2 * Math.PI);
			const yPosition = -rect.width - (index * rect.height + 10);
			const xPosition = gsap.utils.random(rect.width / 2, this.width - rect.width / 2);
			const radius = gsap.getProperty(innerItem, 'border-radius');

			const pill = Bodies.rectangle(xPosition, yPosition, rect.width, rect.height, {
				chamfer: { radius },
				angle,
				isStatic: true,
				restitution: 0.3,
			});

			this.bodies.push(pill);

			Events.on(this.runner, 'tick', () => {
				if (this.runner.enabled) {
					innerItem.style.transform =
						'translate(-50%,-50%) rotate(' + pill.angle.toFixed(2) + 'rad)';
					ySetter(pill.position.y.toFixed(1));
					xSetter(pill.position.x.toFixed(1));
				}
			});
		});

		Composite.add(this.engine.world, this.bodies);
	};

	this.updateBodies = function () {
		this.item.forEach((item, n) => {
			const currentRect = this.bodies[n];
			const innerItem = item.querySelector('span');
			const rect = item.getBoundingClientRect();
			const radius = gsap.getProperty(innerItem, 'border-radius');
			const newRect = Bodies.rectangle(
				currentRect.position.x,
				currentRect.position.y,
				rect.width,
				rect.height,
				{ chamfer: { radius }, angle: currentRect.angle }
			);

			Body.setVertices(currentRect, newRect.vertices);

			if (currentRect.position.y > this.height) {
				Body.setPosition(currentRect, {
					y: this.height / 2,
					x: currentRect.position.x,
				});

				if (currentRect.position.x > this.width) {
					const left = gsap.utils.random(rect.width / 2, this.width - rect.width / 2);
					Body.setPosition(currentRect, {
						y: currentRect.position.y,
						x: left,
					});
				}
			}
		});
	};

	this.unfoldBodies = function () {
		const isLg = this.isLg ? 200 : 80;

		this.bodies.forEach(function (rect, index) {
			setTimeout(() => Body.setStatic(rect, false), index * isLg);
		});

		let n = true;
		Events.on(this.runner, 'tick', () => {
			if (n && this.bodies[this.bodies.length - 1].position.y > 70) {
				this.createTopWall();
				this.isLg || this.makeScrollGravity();
				n = false;
			}
		});
	};

	this.init = function () {
		this.createWorld();
		this.createWalls();
		this.createBodies();
		this.startObserver();
		this.startUnfoldObserver();
		this.bindResize();
	};
}

// wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
	new Pills().init();
});
