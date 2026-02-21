module Counter::counter{

    use std::signer;

    struct Counter has key {
        value: u64,
    }

    public entry fun init_counter(account: &signer) {
        move_to(account, Counter { value: 0 });
    }

    public entry fun increment(account: &signer) acquires Counter {
        let counter = borrow_global_mut<Counter>(signer::address_of(account));
        counter.value = counter.value + 1;
    }

    public fun get_value(addr: address): u64 acquires Counter {
        borrow_global<Counter>(addr).value
    }
}