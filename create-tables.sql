create table if not exists account (
    username varchar(255) not null unique,
    password varchar(255) not null,
    salt varchar(255) not null
);

create table if not exists game (
    account varchar(255) not null unique,
    stardust integer not null,
    click_power integer not null,

    foreign key (account) references account(username)
        on delete cascade,

    check (stardust >= 0),
    check (click_power >= 1)
);

create table if not exists star (
    name varchar(255) not null,
    image_url varchar(255) not null,
    total_clicks integer not null,
    game varchar(255) not null unique,

    foreign key (game) references game(account)
        on delete cascade,

    check (total_clicks >= 0)
);

create table if not exists upgrade (
    name varchar(255) not null unique,
    description varchar(255) not null,
    cost integer not null,

    check (cost > 0)
);

create table if not exists power_upgrade (
    upgrade varchar(255) not null unique,
    power_increase integer not null,

    foreign key (upgrade) references upgrade(name)
        on delete cascade,

    check (power_increase > 0)
);

create table if not exists multiplier_upgrade (
    upgrade varchar(255) not null unique,
    multiplier integer not null,

    foreign key (upgrade) references upgrade(name)
        on delete cascade,

    check (multiplier > 1)
);

create table if not exists game_upgrade (
    game varchar(255) not null,
    upgrade varchar(255) not null,

    primary key (game, upgrade),

    foreign key (game) references game(account)
        on delete cascade,

    foreign key (upgrade) references upgrade(name)
        on delete cascade
);

create table if not exists building (
    name varchar(255) not null unique,
    description varchar(255) not null,
    cost integer not null,
    stardust_per_second integer not null,

    check (cost > 0),
    check (stardust_per_second > 0)
);

create table if not exists star_collector (
    building varchar(255) not null unique,

    foreign key (building) references building(name)
        on delete cascade
);

create table if not exists nebula_factory (
    building varchar(255) not null unique,

    foreign key (building) references building(name)
        on delete cascade
);

create table if not exists game_building (
    game varchar(255) not null,
    building varchar(255) not null,
    quantity integer not null default 0,

    primary key (game, building),

    foreign key (game) references game(account)
        on delete cascade,

    foreign key (building) references building(name)
        on delete cascade,

    check (quantity >= 0)
);

-- =========================================================
-- Upgrade inventory
-- =========================================================

insert into upgrade (
    name,
    description,
    cost
)
values
    -- Original upgrades
    (
        'Solar Flare',
        'Adds five to click power.',
        10
    ),
    (
        'Gravity Well',
        'Multiplies click power by two.',
        30
    ),

    -- New PowerUpgrade items
    (
        'Comet Strike',
        'Adds ten to click power.',
        75
    ),
    (
        'Stellar Pulse',
        'Adds twenty-five to click power.',
        200
    ),
    (
        'Supernova Burst',
        'Adds fifty to click power.',
        500
    ),

    -- New MultiplierUpgrade items
    (
        'Lunar Lens',
        'Multiplies click power by three.',
        150
    ),
    (
        'Cosmic Prism',
        'Multiplies click power by four.',
        400
    ),
    (
        'Quantum Orbit',
        'Multiplies click power by five.',
        1000
    )
on conflict (name) do nothing;

insert into power_upgrade (
    upgrade,
    power_increase
)
values
    (
        'Solar Flare',
        5
    ),
    (
        'Comet Strike',
        10
    ),
    (
        'Stellar Pulse',
        25
    ),
    (
        'Supernova Burst',
        50
    )
on conflict (upgrade) do nothing;

insert into multiplier_upgrade (
    upgrade,
    multiplier
)
values
    (
        'Gravity Well',
        2
    ),
    (
        'Lunar Lens',
        3
    ),
    (
        'Cosmic Prism',
        4
    ),
    (
        'Quantum Orbit',
        5
    )
on conflict (upgrade) do nothing;

-- =========================================================
-- Building inventory
-- =========================================================

insert into building (
    name,
    description,
    cost,
    stardust_per_second
)
values
    -- Original buildings
    (
        'Star Collector',
        'Automatically collects Stardust.',
        50,
        1
    ),
    (
        'Nebula Factory',
        'Produces a larger amount of Stardust.',
        200,
        5
    ),

    -- New StarCollector items
    (
        'Solar Harvester',
        'Collects Stardust using solar energy.',
        125,
        3
    ),
    (
        'Photon Collector',
        'Collects fast-moving particles of Stardust.',
        300,
        8
    ),

    -- New NebulaFactory items
    (
        'Galactic Foundry',
        'Produces Stardust using galactic materials.',
        750,
        20
    ),
    (
        'Dark Matter Plant',
        'Produces large amounts of Stardust from dark matter.',
        2000,
        60
    )
on conflict (name) do nothing;

insert into star_collector (
    building
)
values
    (
        'Star Collector'
    ),
    (
        'Solar Harvester'
    ),
    (
        'Photon Collector'
    )
on conflict (building) do nothing;

insert into nebula_factory (
    building
)
values
    (
        'Nebula Factory'
    ),
    (
        'Galactic Foundry'
    ),
    (
        'Dark Matter Plant'
    )
on conflict (building) do nothing;