import { isRef, mergeProps, toValue } from "vue";
import { assign, flatMap, isArray, isFunction, isNumber, mergeWith } from "lodash-es";

// 是否对象
export function isObject(val: any) {
	return val !== null && typeof val === "object";
}

// 解析px
export function parsePx(val: string | number) {
	return isNumber(val) ? `${val}px` : val;
}

// 数据设置
export function dataset(obj: any, key: string, value: any): any {
	const isGet = value === undefined;
	let d = obj;

	const arr = flatMap(
		key.split(".").map((e) => {
			if (e.includes("[")) {
				return e.split("[").map((e) => e.replace(/"/g, ""));
			} else {
				return e;
			}
		})
	);

	try {
		for (let i = 0; i < arr.length; i++) {
			const e: any = arr[i];
			let n: any = null;

			if (e.includes("]")) {
				const [k, v] = e.replace("]", "").split(":");

				if (v) {
					n = d.findIndex((x: any) => x[k] == v);
				} else {
					n = Number(k);
				}
			} else {
				n = e;
			}

			if (i != arr.length - 1) {
				d = d[n];
			} else {
				if (isGet) {
					return d[n];
				} else {
					if (isObject(value)) {
						assign(d[n], value);
					} else {
						d[n] = value;
					}
				}
			}
		}

		return obj;
	} catch (e) {
		console.error("[dataset] format error", `${key}`);
		return {};
	}
}

// 元素是否包含
export function contains(parent: any, node: any) {
	return parent !== node && parent && parent.contains(node);
}

// 合并配置
export function mergeConfig(a: any, b?: any): any {
	return b ? mergeProps(a, b) : a;
}

// 合并数据
export function merge(d1: any, d2: any) {
	return mergeWith(d1, d2, (_, b) => {
		if (isArray(b)) {
			return b;
		}
	});
}

// 添加元素
export function addClass(el: Element, name: string) {
	if (el?.classList) {
		el.classList.add(name);
	}
}

// 移除元素
export function removeClass(el: Element, name: string) {
	if (el?.classList) {
		el.classList.remove(name);
	}
}

// 获取值
export function getValue<T = any>(value: T | Vue.Ref<T> | ((d: any) => T), data?: any): T {
	if (isRef(value)) {
		return toValue(value) as T;
	} else {
		if (isFunction(value)) {
			return value(data);
		} else {
			return value as T;
		}
	}
}

// 深度查找
export function deepFind(value: any, list: any[], options?: { allLevels: boolean }) {
	const { allLevels = true } = options || {};

	function deep(arr: DictOptions, name: string[]): any | undefined {
		for (const e of arr) {
			if (e.value === value) {
				if (allLevels) {
					return {
						...e,
						label: [...name, e.label].join(" / ")
					};
				} else {
					return e;
				}
			} else if (e.children) {
				const d = deep(e.children, [...name!, e.label!]);

				if (d !== undefined) {
					return d;
				}
			}
		}
		return undefined;
	}

	return deep(list, []);
}

// uuid
export function uuid(separator = "-"): string {
	const s: any[] = [];
	const hexDigits = "0123456789abcdef";
	for (let i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = separator;

	return s.join("");
}

// 移除相同的方法
export function uniqueFns(fns: any[]) {
	const arr = new Map();
	fns.forEach((fn) => {
		arr.set(fn.name, fn);
	});
	return Array.from(arr.values());
}
