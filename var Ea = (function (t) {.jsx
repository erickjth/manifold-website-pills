var Ea = (function (t) {
	var e, n;
	function i() {
		var e;
		return (
			((e = t.apply(this, arguments) || this).isLg = e.el.classList.contains('-lg')),
			(e.isXl = e.el.classList.contains('-xl')),
			(e.item = Array.from(e.el.querySelectorAll('.pt-fallbox-item'))),
			e.createWorld(),
			e.createWalls(),
			e.createBodies(),
			e.startObserver(),
			e.startUnfoldObserver(),
			e.bindResize(),
			e.bindCursor(),
			e
		);
	}
	(n = t),
		((e = i).prototype = Object.create(n.prototype)),
		(e.prototype.constructor = e),
		Ca(e, n);
	var r = i.prototype;
	return (
		(r.startObserver = function () {
			var t = this;
			(this.observer = new IntersectionObserver(function (e) {
				t.runner.enabled = e[0].isIntersecting;
			})),
				this.observer.observe(this.el);
		}),
		(r.startUnfoldObserver = function () {
			var t = this;
			(this.unfoldObserver = new IntersectionObserver(
				function (e) {
					e[0].isIntersecting && (t.unfoldBodies(), t.unfoldObserver.disconnect());
				},
				{
					rootMargin: '-50% 0% -35% 0%',
				}
			)),
				this.unfoldObserver.observe(this.el);
		}),
		(r.bindResize = function () {
			var t = this;
			(this.resizeFn = function () {
				return t.refresh();
			}),
				window.addEventListener('resize', this.resizeFn);
		}),
		(r.bindCursor = function () {
			var t = this.app.get('cursor').cursor;
			if (!t) return !1;
			this.item.forEach(function (e) {
				e.addEventListener('mouseenter', function () {
					return t.addState('-pointer');
				}),
					e.addEventListener('mouseleave', function () {
						return t.removeState('-pointer');
					});
			});
		}),
		(r.createWorld = function () {
			(this.height = this.el.offsetHeight),
				(this.width = this.el.offsetWidth),
				(this.engine = Sa.a.Engine.create()),
				(this.runner = Sa.a.Runner.create()),
				(this.mouse = Sa.a.Mouse.create(this.el)),
				this.el.removeEventListener('mousewheel', this.mouse.mousewheel),
				this.el.addEventListener('mouseleave', this.mouse.mouseup),
				(this.mouseConstraint = Sa.a.MouseConstraint.create(this.engine, {
					mouse: this.mouse,
					constraint: {
						render: {
							visible: !1,
						},
					},
				})),
				(this.engine.world.gravity.y = 0.8),
				Sa.a.Composite.add(this.engine.world, [this.mouseConstraint]),
				Sa.a.Runner.start(this.runner, this.engine),
				(this.runner.enabled = !1);
		}),
		(r.refresh = function () {
			var t = this;
			if (this.height === this.el.offsetHeight && this.width === this.el.offsetWidth)
				return !1;
			(this.height = this.el.offsetHeight),
				(this.width = this.el.offsetWidth),
				setTimeout(function () {
					t.updateWalls(), t.updateBodies();
				});
		}),
		(r.createWalls = function () {
			(this.wallL = Sa.a.Bodies.rectangle(-250, this.height / 2, 500, 4 * this.height, {
				isStatic: !0,
			})),
				(this.wallR = Sa.a.Bodies.rectangle(
					this.width + 250,
					this.height / 2,
					500,
					4 * this.height,
					{
						isStatic: !0,
					}
				)),
				(this.wallB = Sa.a.Bodies.rectangle(0, this.height + 250, 2 * this.width, 500, {
					isStatic: !0,
				})),
				Sa.a.Composite.add(this.engine.world, [this.wallB, this.wallL, this.wallR]);
		}),
		(r.createTopWall = function () {
			(this.wallT = Sa.a.Bodies.rectangle(0, -250, 2 * this.width, 500, {
				isStatic: !0,
			})),
				Sa.a.Composite.add(this.engine.world, [this.wallT]);
		}),
		(r.makeScrollGravity = function () {
			var t = this,
				e = this.isXl ? 0.07 : 0.2,
				n = 0;
			Sa.a.Events.on(this.runner, 'tick', function () {
				var i = t.app.get('page').scrollTop(),
					r = i - n;
				(t.engine.world.gravity.y = 0.8 - Ui.utils.clamp(-2, 4, r * e)), (n = i);
			});
		}),
		(r.updateWalls = function () {
			this.wallT &&
				Sa.a.Body.setVertices(
					this.wallT,
					Sa.a.Bodies.rectangle(0, -250, 2 * this.width, 500, {
						isStatic: !0,
					}).vertices
				),
				this.wallL &&
					(Sa.a.Body.setPosition(this.wallL, {
						x: -250,
						y: this.height / 2,
					}),
					Sa.a.Body.setVertices(
						this.wallL,
						Sa.a.Bodies.rectangle(-250, this.height / 2, 500, 4 * this.height, {
							isStatic: !0,
						}).vertices
					)),
				this.wallR &&
					(Sa.a.Body.setPosition(this.wallR, {
						x: this.width + 250,
						y: this.height / 2,
					}),
					Sa.a.Body.setVertices(
						this.wallR,
						Sa.a.Bodies.rectangle(
							this.width + 250,
							this.height / 2,
							500,
							4 * this.height,
							{
								isStatic: !0,
							}
						).vertices
					)),
				this.wallB &&
					(Sa.a.Body.setPosition(this.wallB, {
						x: 0,
						y: this.height + 250,
					}),
					Sa.a.Body.setVertices(
						this.wallB,
						Sa.a.Bodies.rectangle(0, this.height + 250, 2 * this.width, 500, {
							isStatic: !0,
						}).vertices
					));
		}),
		(r.createBodies = function () {
			var t = this;
			(this.bodies = []),
				this.item.forEach(function (e, n) {
					var i = e.querySelector('span'),
						r = e.getBoundingClientRect(),
						o = Ui.quickSetter(e, 'x', 'px'),
						s = Ui.quickSetter(e, 'y', 'px'),
						a = Ui.utils.random(0.2 * -Math.PI, 0.2 * Math.PI),
						l = -r.width - (n * r.height + 10),
						u = Ui.utils.random(r.width / 2, t.width - r.width / 2),
						c = Ui.getProperty(i, 'border-radius'),
						d = Sa.a.Bodies.rectangle(u, l, r.width, r.height, {
							chamfer: {
								radius: c,
							},
							angle: a,
							isStatic: !0,
							restitution: 0.3,
						});
					t.bodies.push(d),
						Sa.a.Composite.add(t.engine.world, [d]),
						Sa.a.Events.on(t.runner, 'tick', function () {
							t.runner.enabled &&
								((i.style.transform =
									'translate(-50%,-50%) rotate(' + d.angle.toFixed(2) + 'rad)'),
								s(d.position.y.toFixed(1)),
								o(d.position.x.toFixed(1)));
						});
				});
		}),
		(r.updateBodies = function () {
			var t = this;
			this.item.forEach(function (e, n) {
				var i = t.bodies[n],
					r = e.querySelector('span'),
					o = e.getBoundingClientRect(),
					s = Ui.getProperty(r, 'border-radius'),
					a = Sa.a.Bodies.rectangle(i.position.x, i.position.y, o.width, o.height, {
						chamfer: {
							radius: s,
						},
						angle: i.angle,
					});
				if (
					(Sa.a.Body.setVertices(i, a.vertices),
					i.position.y > t.height &&
						Sa.a.Body.setPosition(i, {
							y: t.height / 2,
							x: i.position.x,
						}),
					i.position.x > t.width)
				) {
					var l = Ui.utils.random(o.width / 2, t.width - o.width / 2);
					Sa.a.Body.setPosition(i, {
						y: i.position.y,
						x: l,
					});
				}
			});
		}),
		(r.unfoldBodies = function () {
			var t = this,
				e = this.isLg ? 200 : 80;
			this.bodies.forEach(function (t, n) {
				setTimeout(function () {
					return Sa.a.Body.setStatic(t, !1);
				}, n * e);
			});
			var n = !0;
			Sa.a.Events.on(this.runner, 'tick', function () {
				n &&
					t.bodies[t.bodies.length - 1].position.y > 70 &&
					(t.createTopWall(), t.isLg || t.makeScrollGravity(), (n = !1));
			});
		}),
		(r.destroy = function () {
			this.observer.disconnect(),
				this.unfoldObserver.disconnect(),
				(this.runner.enabled = !1),
				Sa.a.Runner.stop(this.runner),
				window.removeEventListener('resize', this.resizeFn);
		}),
		(r.onDestroy = function () {
			return new Promise(
				function (t, e) {
					return this.destroy(), t();
				}.bind(this)
			);
		}),
		i
	);
})(r);
