import { StoreAdapter } from '../../domain';

type kvStores = 'sdk-kv-store' | 'key-value-pairs';

export class StoreAdapterWeb extends StoreAdapter {
	static readonly DB_NAME = 'multichain-kv-store';

	readonly platform = 'web';
	readonly dbPromise: Promise<IDBDatabase>;

	private get internal() {
		if (typeof window === 'undefined' || !window.indexedDB) {
			throw new Error('indexedDB is not available in this environment');
		}
		return window.indexedDB;
	}

	constructor(
		private storeName: kvStores = 'sdk-kv-store',
		private prefix = 'mwp-',
	) {
		super();
		this.dbPromise = new Promise((resolve, reject) => {
			const request = this.internal.open(StoreAdapterWeb.DB_NAME, 1);
			request.onerror = () => reject(new Error('Failed to open IndexedDB.'));
			request.onsuccess = () => resolve(request.result);
			request.onupgradeneeded = () => {
				request.result.createObjectStore(storeName);
			};
		});
	}

	async get(key: string): Promise<string | null> {
		const { storeName } = this;
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const request = store.get(this.getKey(key));
			request.onerror = () => reject(new Error('Failed to get value from IndexedDB.'));
			request.onsuccess = () => resolve((request.result as string) ?? null);
		});
	}

	async set(key: string, value: string): Promise<void> {
		const { storeName } = this;
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.put(value, this.getKey(key));
			request.onerror = () => reject(new Error('Failed to set value in IndexedDB.'));
			request.onsuccess = () => resolve();
		});
	}

	async delete(key: string): Promise<void> {
		const { storeName } = this;
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.delete(this.getKey(key));
			request.onerror = () => reject(new Error('Failed to delete value from IndexedDB.'));
			request.onsuccess = () => resolve();
		});
	}

	private getKey(key: string): string {
		return `${this.prefix}${key}`;
	}
}
