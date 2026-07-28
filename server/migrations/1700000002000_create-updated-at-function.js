export const up = (pgm) => {
    pgm.sql(`
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
}

export const down = (pgm) => {
    pgm.sql(`
        DROP FUNCTION IF EXISTS set_updated_at();
    `);
}