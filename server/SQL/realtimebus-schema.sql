--
-- PostgreSQL database dump
--

-- Dumped from database version 9.1.7
-- Dumped by pg_dump version 9.1.7
-- Started on 2014-03-09 22:38:21 CET

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 7 (class 2615 OID 591656)
-- Name: vdv; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vdv;


SET search_path = vdv, pg_catalog;

--
-- TOC entry 989 (class 1255 OID 591657)
-- Dependencies: 7 1412
-- Name: vdv_bigint_2_degree(bigint); Type: FUNCTION; Schema: vdv; Owner: -
--

CREATE FUNCTION vdv_bigint_2_degree(vdv_bigint bigint) RETURNS double precision
    LANGUAGE plpgsql IMMUTABLE COST 10
    AS $$
        BEGIN
		RETURN 
		vdv_bigint/10000000::bigint + --degrees
		((vdv_bigint % 10000000::bigint) /  100000) * (1::float / 60::float) +  -- minutes
		((vdv_bigint % 100000::bigint) /  1000)  * (1::float / 3600::float) + -- seconds
		(vdv_bigint % 1000::bigint)  * (1::float / 3600::float/1000::float); -- fraction of seconds
        END;
$$;


--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 989
-- Name: FUNCTION vdv_bigint_2_degree(vdv_bigint bigint); Type: COMMENT; Schema: vdv; Owner: -
--

COMMENT ON FUNCTION vdv_bigint_2_degree(vdv_bigint bigint) IS 'Convert bigints formatted as DDMMSSNNN into decimal degrees
Beware, works only for positive arguments';


--
-- TOC entry 993 (class 1255 OID 986654)
-- Dependencies: 1412 7
-- Name: vdv_extrapolate_frt_position(bigint); Type: FUNCTION; Schema: vdv; Owner: -
--

CREATE FUNCTION vdv_extrapolate_frt_position(teq_nummer_arg bigint) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    pos_record RECORD;
    elapsed_time FLOAT;
    var_sel_fzt INTEGER;
    rec_sel_fzt RECORD;
    cnt_lfd INTEGER DEFAULT 0;
    underrelaxation DOUBLE PRECISION DEFAULT 0.8;
    time_to_complete_travel DOUBLE PRECISION DEFAULT 0;
    extrapolated_completion DOUBLE PRECISION DEFAULT 0;
    extrapolated_linear_ref_var DOUBLE PRECISION DEFAULT 0;
    extrapolated_position_var geometry;
    max_li_lfd_nr INTEGER;
    distance_to_end DOUBLE PRECISION;
    frt RECORD;
    complete_travel_time INTEGER;
BEGIN

    -- Get all known data
    SELECT vehicle_position_act.*,
        ST_X(vehicle_position_act.the_geom) x_act,
        ST_Y(vehicle_position_act.the_geom) y_act,
        lid_verlauf.ort_nr ort_nr,
        next_verlauf.ort_nr next_ort_nr,
        ort_edges.id ort_edge_id,
        ST_X(vehicle_position_act.the_geom) - ST_X(ST_Line_Interpolate_Point(ort_edges.the_geom, interpolation_linear_ref)) dx,
        ST_Y(vehicle_position_act.the_geom) - ST_Y(ST_Line_Interpolate_Point(ort_edges.the_geom, interpolation_linear_ref)) dy
    INTO pos_record
    FROM vdv.vehicle_position_act
    LEFT JOIN vdv.lid_verlauf
        ON lid_verlauf.li_nr=vehicle_position_act.li_nr
        AND lid_verlauf.str_li_var=vehicle_position_act.str_li_var
        AND lid_verlauf.li_lfd_nr = vehicle_position_act.li_lfd_nr
    LEFT JOIN vdv.lid_verlauf AS next_verlauf
        ON next_verlauf.li_nr=lid_verlauf.li_nr
        AND next_verlauf.str_li_var=lid_verlauf.str_li_var
        AND next_verlauf.li_lfd_nr = lid_verlauf.li_lfd_nr + 1
    LEFT JOIN vdv.ort_edges
        ON lid_verlauf.ort_nr=ort_edges.start_ort_nr
        AND lid_verlauf.onr_typ_nr=ort_edges.start_onr_typ_nr
        AND next_verlauf.ort_nr=ort_edges.end_ort_nr
        AND next_verlauf.onr_typ_nr=ort_edges.end_onr_typ_nr
    WHERE frt_fid=teq_nummer_arg;

    -- Calc elapsed time
    elapsed_time = EXTRACT('epoch' FROM current_timestamp-pos_record.gps_date);

    SELECT frt_fid, frt_start INTO frt
    FROM vdv.rec_frt
    WHERE teq_nummer=teq_nummer_arg;
  
    IF EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE)) < frt.frt_start - 10
       AND pos_record.delay_sec = 0 THEN

        -- Bus is waiting at departure
       UPDATE vdv.vehicle_position_act
       SET status = 'w'
       WHERE frt_fid=teq_nummer_arg;
       RETURN 0;
    END IF;


    SELECT MAX(travel_time) INTO complete_travel_time
    FROM vdv.travel_times
    WHERE frt_fid=frt.frt_fid;

    IF EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE)) > frt.frt_start +
                                                                complete_travel_time +
                                                                pos_record.delay_sec + 120
       THEN
       RAISE DEBUG 'now: %, start: %, travel_time: %, delay: %, sum: %',
         EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE)),
           frt.frt_start,
           complete_travel_time,
           pos_record.delay_sec,
           frt.frt_start + complete_travel_time + pos_record.delay_sec + 120;

        -- Bus is waiting at departure
       UPDATE vdv.vehicle_position_act
       SET status = 'f'
       WHERE frt_fid=teq_nummer_arg;
       RETURN 0;
    END IF;

-- -- > EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE))
--     -- get departure and arrival time
--     
--     RAISE INFO 'Already at segment end';
--     SELECT MAX(li_lfd_nr) INTO max_li_lfd_nr
--     FROM vdv.lid_verlauf
--     WHERE lid_verlauf.li_nr=pos_record.li_nr
--     AND lid_verlauf.str_li_var=pos_record.str_li_var;
-- 
--     RAISE INFO 'li_lfd_nr=%, MAX(li_lfd_nr)=%', pos_record.li_lfd_nr, max_li_lfd_nr;
-- 
--     SELECT St_Distance(pos_record.the_geom, rec_ort.the_geom) INTO distance_to_end
--     FROM vdv.lid_verlauf
--     INNER JOIN vdv.rec_ort
--         ON lid_verlauf.ort_nr=rec_ort.ort_nr
--         AND lid_verlauf.onr_typ_nr=rec_ort.onr_typ_nr
--     WHERE vdv.lid_verlauf.li_nr=pos_record.li_nr
--     AND lid_verlauf.str_li_var=pos_record.str_li_var
--     AND lid_verlauf.li_lfd_nr=max_li_lfd_nr;
-- 
--     RAISE INFO 'Distance to end is %', distance_to_end;
-- 
--     IF distance_to_end < 30 AND pos_record.arrival_time IS NULL THEN
--         UPDATE vdv.vehicle_position_act
--         SET arrival_time=pos_record.gps_date,
--             status='f'
--         WHERE frt_fid=teq_nummer_arg;
--         RETURN 0;
--     END IF;

    RAISE DEBUG 'x_act: %, y_act: %, ort_nr: %, next_ort_nr: %, ort_edge_id: %, dx: %, dy: %',
    pos_record.x_act, pos_record.y_act,
    pos_record.ort_nr, pos_record.next_ort_nr, pos_record.ort_edge_id,
    pos_record.dx, pos_record.dy;
    
    IF pos_record.frt_fid IS NULL THEN
        RAISE WARNING 'No record found with frt_fid: %', pos_record.frt_fid;
        UPDATE vdv.vehicle_position_act
        SET extrapolation_linear_ref=NULL,
            extrapolation_geom=NULL,
            status='e'
        WHERE frt_fid=teq_nummer_arg;
        RETURN NULL;
    END IF;
    
    SELECT COUNT(*) INTO cnt_lfd
    FROM vdv.rec_frt
    INNER JOIN vdv.lid_verlauf
        ON lid_verlauf.li_nr=rec_frt.li_nr
        AND lid_verlauf.str_li_var=rec_frt.str_li_var
    WHERE teq_nummer=teq_nummer_arg;
    
    IF cnt_lfd=0 THEN
        RAISE WARNING 'teq_nummer % has no entries in lid_verlauf', pos_record.frt_fid;
        UPDATE vdv.vehicle_position_act
        SET extrapolation_linear_ref=NULL,
            extrapolation_geom=NULL,
            status='e'
        WHERE frt_fid=teq_nummer_arg;
        RETURN NULL;
    END IF;

    -- Get travel time
    SELECT verlauf_start.li_lfd_nr lfd_start,
        verlauf_end.li_lfd_nr lfd_end,
        ort_start.ort_nr ort_start,
        ort_end.ort_nr ort_end,
        sel_fzt,
        ort_end.ort_nr ort_end
        INTO rec_sel_fzt
    FROM vdv.lid_verlauf verlauf_start
    LEFT JOIN vdv.lid_verlauf verlauf_end
        ON verlauf_start.li_nr=verlauf_end.li_nr
        AND verlauf_start.str_li_var=verlauf_end.str_li_var
        AND verlauf_start.li_lfd_nr + 1 = verlauf_end.li_lfd_nr
    LEFT JOIN vdv.rec_ort ort_start
        ON verlauf_start.onr_typ_nr=ort_start.onr_typ_nr
        AND verlauf_start.ort_nr=ort_start.ort_nr
    LEFT JOIN vdv.rec_ort ort_end
        ON verlauf_end.onr_typ_nr=ort_end.onr_typ_nr
        AND verlauf_end.ort_nr=ort_end.ort_nr
    LEFT JOIN vdv.sel_fzt_feld
        ON ort_start.onr_typ_nr=sel_fzt_feld.onr_typ_nr
        AND ort_start.ort_nr=sel_fzt_feld.ort_nr
        AND ort_end.onr_typ_nr=sel_fzt_feld.sel_ziel_typ
        AND ort_end.ort_nr=sel_fzt_feld.sel_ziel
    WHERE verlauf_start.li_nr=pos_record.li_nr
        AND verlauf_start.str_li_var=pos_record.str_li_var
        AND verlauf_start.li_lfd_nr=pos_record.li_lfd_nr;
        
    RAISE DEBUG 'lfd_start: %, lfd_end: % s, ort_start %, ort_end: %, sel_fzt: %', rec_sel_fzt.lfd_start, rec_sel_fzt.lfd_end, rec_sel_fzt.ort_start, rec_sel_fzt.ort_end, rec_sel_fzt.sel_fzt;

    IF rec_sel_fzt.sel_fzt IS NULL THEN
        RAISE WARNING 'Could not find any travel time information in vdv.sel_fzt_feld for teq_nummer=%', pos_record.frt_fid;
        UPDATE vdv.vehicle_position_act
        SET extrapolation_linear_ref=NULL,
            extrapolation_geom=NULL,
            status='e'
        WHERE frt_fid=teq_nummer_arg;
        RETURN NULL;
    END IF;
        
    
    IF elapsed_time <= 0 THEN
        IF pos_record.status <> 'e' THEN
            UPDATE vdv.vehicle_position_act
            SET status='e'
            WHERE frt_fid=teq_nummer_arg;
        END IF;
        RETURN 0;
    END IF;

    -- Extrapolate only, if the bus has not already arrived
    -- at the end position
    IF pos_record.interpolation_linear_ref >= 1 THEN
        IF pos_record.status <> 'e' THEN
            UPDATE vdv.vehicle_position_act
            SET status='e'
            WHERE frt_fid=teq_nummer_arg;
        END IF;
        RETURN 0;
    END IF;

    -- estimated plan time to complete the travel
    time_to_complete_travel = (1 - pos_record.interpolation_linear_ref) * rec_sel_fzt.sel_fzt;
    RAISE DEBUG 'elapsed_time: %, time needed to complete travel: %', elapsed_time, time_to_complete_travel;
    if time_to_complete_travel > 0 THEN
        extrapolated_completion = underrelaxation * elapsed_time/time_to_complete_travel;
    ELSE
        extrapolated_completion = 1;
    END IF;

    extrapolated_linear_ref_var = LEAST(1, pos_record.interpolation_linear_ref +
                                         (1 - pos_record.interpolation_linear_ref) * extrapolated_completion);

    RAISE DEBUG 'completed: %, interpolation_linear_ref: %, extrapolation_linear_ref: %, weighting factor: %, weighted dx: %, weighted dy: %',
            extrapolated_completion,
            pos_record.interpolation_linear_ref,
            extrapolated_linear_ref_var, (1 - extrapolated_completion), 
            (1 - extrapolated_completion) * pos_record.dx,
            (1 - extrapolated_completion) * pos_record.dy;

    SELECT ST_Line_Interpolate_Point(the_geom, extrapolated_linear_ref_var) INTO extrapolated_position_var
    FROM vdv.lid_verlauf
    WHERE lid_verlauf.li_nr=pos_record.li_nr
        AND lid_verlauf.str_li_var=pos_record.str_li_var
        AND lid_verlauf.li_lfd_nr = pos_record.li_lfd_nr;


    RAISE DEBUG 'extra_pos: %, distance to last extra_pos is % and last GPS value is %',
                AsText(extrapolated_position_var),
               ST_Distance(extrapolated_position_var, pos_record.extrapolation_geom),
               ST_Distance(extrapolated_position_var, pos_record.the_geom);

     -- write to database
    UPDATE vdv.vehicle_position_act
    SET extrapolation_linear_ref=extrapolated_linear_ref_var,
        extrapolation_geom=extrapolated_position_var,
        status='r'
    WHERE frt_fid=teq_nummer_arg;

    RETURN 1;
END;
$$;


--
-- TOC entry 994 (class 1255 OID 992818)
-- Dependencies: 7 1412
-- Name: vdv_extrapolate_positions(); Type: FUNCTION; Schema: vdv; Owner: -
--

CREATE FUNCTION vdv_extrapolate_positions() RETURNS integer
    LANGUAGE plpgsql
    AS $$
    --
    -- Create a subblock
    --
    DECLARE
        frt_cur CURSOR FOR
            SELECT vehicle_position_act.frt_fid
            FROM vdv.vehicle_position_act
            LEFT JOIN vdv.rec_frt ON vehicle_position_act.frt_fid=rec_frt.teq_nummer
            WHERE rec_frt.frt_fid IS NULL   -- not found in rec_frt
                OR frt_start < EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE)) -- should have already started
                OR delay_sec < 0   -- anticipated start 
            ORDER BY frt_fid;
        num_frts INTEGER;
        num_insert INTEGER DEFAULT 0;
        num_extrapolations INTEGER DEFAULT 0;
        
    BEGIN
    num_frts := 0;

    DELETE FROM vdv.vehicle_position_act
        WHERE gps_date < NOW() - interval '10 minute';

    FOR recordvar IN frt_cur LOOP
        SELECT vdv.vdv_extrapolate_frt_position(recordvar.frt_fid) INTO num_insert;
        num_frts := num_frts+1;
        IF num_insert IS NOT NULL THEN
            num_extrapolations = num_extrapolations + 1;
        END IF;
    END LOOP;
    RAISE INFO 'inserted % records processed, extrapolated % new positions',
            num_frts, num_extrapolations;
    
    RETURN num_frts;
END;
$$;


--
-- TOC entry 992 (class 1255 OID 771507)
-- Dependencies: 1412 7
-- Name: vdv_fill_frt_travel_times(bigint); Type: FUNCTION; Schema: vdv; Owner: -
--

CREATE FUNCTION vdv_fill_frt_travel_times(frt_fid_arg bigint) RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
        this_li_nr integer;
        this_str_li_var varchar(6);
        this_fgr_nr integer;
        
        outer_lfd_cursor refcursor;
        from_to_stop record;
        from_stop INTEGER;
        to_stop INTEGER;
        
        num_inserts INTEGER;

        frt_start_lfd INTEGER;
        frt_max_lfd INTEGER;
        frt_cnt INTEGER;
        
        travel_time_seconds INTEGER;
        
        inner_lfd_cursor CURSOR (this_li_nr integer, this_str_li_var varchar(6), this_fgr_nr integer, from_stop integer, to_stop integer) FOR
            SELECT SUM(COALESCE(sel_fzt))
            FROM vdv.lid_verlauf lid_verlauf_start
            INNER JOIN vdv.lid_verlauf lid_verlauf_end
                ON lid_verlauf_end.li_nr=this_li_nr
                AND lid_verlauf_end.str_li_var=this_str_li_var
                AND lid_verlauf_start.li_lfd_nr+1=lid_verlauf_end.li_lfd_nr
                AND lid_verlauf_end.li_lfd_nr <= to_stop
            LEFT JOIN vdv.sel_fzt_feld sff
                ON lid_verlauf_start.ort_nr=sff.ort_nr
                AND lid_verlauf_start.onr_typ_nr=sff.onr_typ_nr
                AND lid_verlauf_end.ort_nr=sff.sel_ziel
                AND lid_verlauf_end.onr_typ_nr=sff.sel_ziel_typ
                AND sff.fgr_nr=this_fgr_nr
            WHERE lid_verlauf_start.li_nr=this_li_nr
                AND lid_verlauf_start.str_li_var=this_str_li_var
                AND lid_verlauf_start.li_lfd_nr >= from_stop;
        
    BEGIN
    num_inserts := 0;
    
    DELETE FROM vdv.travel_times WHERE frt_fid=frt_fid_arg;

    SELECT COUNT(*), MAX(li_lfd_nr) INTO frt_cnt, frt_max_lfd
    FROM vdv.rec_frt
    LEFT JOIN vdv.lid_verlauf
        ON rec_frt.li_nr=lid_verlauf.li_nr
        AND rec_frt.str_li_var=lid_verlauf.str_li_var
    WHERE
        frt_fid=frt_fid_arg;

    IF frt_cnt = 0 THEN
        RAISE NOTICE 'frt_fid % has no lid_verlauf', frt_fid_arg;
        RETURN 0;
    END IF;
    
    -- get line attributes
    SELECT rec_lid.li_nr, rec_lid.str_li_var, rec_frt.fgr_nr
        INTO this_li_nr, this_str_li_var, this_fgr_nr
    FROM vdv.rec_frt
    INNER JOIN vdv.rec_lid
        ON rec_lid.li_nr=rec_frt.li_nr
        AND rec_lid.str_li_var=rec_frt.str_li_var
    WHERE rec_frt.frt_fid=frt_fid_arg;

    frt_start_lfd = 1;

    OPEN outer_lfd_cursor FOR
        SELECT
            lvsp.li_lfd_nr AS start_lfd,
            lvep.li_lfd_nr AS stop_lfd
        FROM vdv.rec_frt
        INNER JOIN vdv.rec_lid
            ON rec_lid.li_nr=rec_frt.li_nr
            AND rec_lid.str_li_var=rec_frt.str_li_var
        INNER JOIN vdv.lid_verlauf lvsp
            ON rec_frt.li_nr=lvsp.li_nr
            AND rec_frt.str_li_var=lvsp.str_li_var
            AND li_lfd_nr=frt_start_lfd
        INNER JOIN vdv.lid_verlauf lvep
            ON rec_frt.li_nr=lvep.li_nr
            AND rec_frt.str_li_var=lvep.str_li_var
            AND lvsp.li_lfd_nr < lvep.li_lfd_nr
        WHERE rec_frt.frt_fid=frt_fid_arg
        ORDER BY lvsp.li_lfd_nr, lvep.li_lfd_nr;
            
    LOOP
        FETCH outer_lfd_cursor INTO from_stop, to_stop;
        
        IF from_stop IS NULL THEN
            -- exit loop
            EXIT;
        END IF;
        
        RAISE INFO 'li_nr % str_li_var % fgr_nr % from % to %', this_li_nr, this_str_li_var, this_fgr_nr, from_stop, to_stop;
        OPEN inner_lfd_cursor(this_li_nr, this_str_li_var, this_fgr_nr, from_stop, to_stop);
        LOOP
            FETCH inner_lfd_cursor INTO travel_time_seconds;
            
            RAISE INFO 'seconds %', travel_time_seconds;
            IF travel_time_seconds IS NULL THEN
                EXIT;
            END IF;
            -- RAISE NOTICE 'seconds %', travel_time_seconds;
            
            -- write into the table with the travel times
            INSERT INTO vdv.travel_times (frt_fid, li_lfd_nr_start, li_lfd_nr_end, travel_time)
            VALUES (frt_fid_arg, from_stop, to_stop, travel_time_seconds);
            
        END LOOP;
        
        CLOSE inner_lfd_cursor;
        num_inserts := num_inserts+1;

    END LOOP;
    
    RETURN num_inserts;
END;
$$;


--
-- TOC entry 990 (class 1255 OID 771540)
-- Dependencies: 1412 7
-- Name: vdv_fill_travel_times(); Type: FUNCTION; Schema: vdv; Owner: -
--

CREATE FUNCTION vdv_fill_travel_times() RETURNS integer
    LANGUAGE plpgsql
    AS $$
    DECLARE
        frt_cur CURSOR FOR
            SELECT frt_fid
            FROM vdv.rec_frt
            ORDER BY frt_fid;
        num_frts INTEGER DEFAULT 0; -- processed frts
        tot_frts INTEGER DEFAULT 0; -- total number of frts 
        num_insert INTEGER DEFAULT 0;
        
    BEGIN

    SELECT COUNT(*) INTO tot_frts FROM vdv.rec_frt;
    FOR recordvar IN frt_cur LOOP

        SELECT vdv.vdv_fill_frt_travel_times(recordvar.frt_fid) INTO num_insert;
        num_frts := num_frts+1;
	    RAISE NOTICE 'inserted % records for frt_fid %, %/% records processed',
            num_insert, recordvar.frt_fid, num_frts, tot_frts;
    END LOOP;
    
    RETURN num_frts;
END;
$$;


--
-- TOC entry 991 (class 1255 OID 732680)
-- Dependencies: 1412 7
-- Name: vdv_seconds_to_hhmm(integer); Type: FUNCTION; Schema: vdv; Owner: -
--

CREATE FUNCTION vdv_seconds_to_hhmm(seconds integer) RETURNS text
    LANGUAGE plpgsql IMMUTABLE COST 10
    AS $$
DECLARE
    time_text TEXT;
    minutes INTEGER;
    hours INTEGER;
BEGIN
    minutes = round(seconds/60::float)::INTEGER;
    hours = floor(minutes/60::float)::INTEGER;
    time_text = to_char(hours, 'FM09') || ':' || to_char(minutes % 60, 'FM09');
    RETURN time_text;
END;
$$;


--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 991
-- Name: FUNCTION vdv_seconds_to_hhmm(seconds integer); Type: COMMENT; Schema: vdv; Owner: -
--

COMMENT ON FUNCTION vdv_seconds_to_hhmm(seconds integer) IS 'Convert seconds from midnight to time formatted as HH:MM';


SET default_with_oids = false;

--
-- TOC entry 167 (class 1259 OID 591690)
-- Dependencies: 7
-- Name: firmenkalender; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE firmenkalender (
    basis_version integer NOT NULL,
    betriebstag integer NOT NULL,
    betriebstag_text character varying(40),
    tagesart_nr integer
);


--
-- TOC entry 177 (class 1259 OID 768010)
-- Dependencies: 7
-- Name: frt_ort_last; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE frt_ort_last (
    frt_fid bigint NOT NULL,
    onr_typ_nr smallint,
    ort_nr integer
);


--
-- TOC entry 180 (class 1259 OID 919788)
-- Dependencies: 7
-- Name: frt_teq_mapping; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE frt_teq_mapping (
    teq_frt_fid bigint NOT NULL,
    frt_fid bigint
);


--
-- TOC entry 168 (class 1259 OID 591693)
-- Dependencies: 3706 3707 3708 1306 7
-- Name: lid_verlauf; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE lid_verlauf (
    basis_version integer NOT NULL,
    li_lfd_nr smallint NOT NULL,
    li_nr integer NOT NULL,
    str_li_var character(6) NOT NULL,
    onr_typ_nr smallint,
    ort_nr integer,
    znr_nr integer,
    anr_nr integer,
    einfangbereich smallint,
    li_knoten smallint,
    einsteigeverbot smallint,
    aussteigeverbot smallint,
    zone_wabe_nr smallint,
    kurzstrecke smallint,
    halte_typ smallint,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'LINESTRING'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 169 (class 1259 OID 591702)
-- Dependencies: 7
-- Name: line_attributes; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE line_attributes (
    li_nr integer NOT NULL,
    li_r smallint,
    li_g smallint,
    li_b smallint
);


--
-- TOC entry 170 (class 1259 OID 591705)
-- Dependencies: 7
-- Name: menge_fgr; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE menge_fgr (
    basis_version integer NOT NULL,
    fgr_nr integer NOT NULL,
    fgr_text character varying(40)
);


--
-- TOC entry 171 (class 1259 OID 591708)
-- Dependencies: 7
-- Name: menge_tagesart; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE menge_tagesart (
    basis_version integer NOT NULL,
    tagesart_nr integer NOT NULL,
    tagesart_text character varying(40)
);


--
-- TOC entry 181 (class 1259 OID 985330)
-- Dependencies: 3716 3717 3718 1306 7
-- Name: ort_edges; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE ort_edges (
    id integer NOT NULL,
    start_onr_typ_nr integer,
    start_ort_nr integer,
    end_onr_typ_nr integer,
    end_ort_nr integer,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'LINESTRING'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 182 (class 1259 OID 985339)
-- Dependencies: 7 181
-- Name: ort_edges_id_seq; Type: SEQUENCE; Schema: vdv; Owner: -
--

CREATE SEQUENCE ort_edges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 182
-- Name: ort_edges_id_seq; Type: SEQUENCE OWNED BY; Schema: vdv; Owner: -
--

ALTER SEQUENCE ort_edges_id_seq OWNED BY ort_edges.id;


--
-- TOC entry 192 (class 1259 OID 1178190)
-- Dependencies: 3731 3732 3733 3734 1306 7
-- Name: ort_edges_new; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE ort_edges_new (
    id integer DEFAULT nextval('ort_edges_id_seq'::regclass) NOT NULL,
    start_onr_typ_nr integer,
    start_ort_nr integer,
    end_onr_typ_nr integer,
    end_ort_nr integer,
    cnt integer,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'LINESTRING'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 172 (class 1259 OID 591711)
-- Dependencies: 7
-- Name: rec_frt; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE rec_frt (
    basis_version integer NOT NULL,
    frt_fid bigint NOT NULL,
    frt_start integer,
    li_nr integer,
    tagesart_nr integer,
    li_ku_nr integer,
    fahrtart_nr smallint,
    fgr_nr integer,
    str_li_var character(6),
    um_uid integer,
    leistungsart_nr integer,
    frt_ext_nr integer,
    znr_nr integer,
    konzessionsinhaber_nr integer,
    auftraggeber_nr integer,
    fremdunternehmer_nr integer,
    fzg_typ_nr smallint,
    bemerkung character varying(1000),
    zugnr character varying(10),
    fahrtart_nummer integer,
    teq_nummer bigint
);


--
-- TOC entry 179 (class 1259 OID 916616)
-- Dependencies: 7
-- Name: rec_frt_fzt; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE rec_frt_fzt (
    basis_version integer,
    frt_fid bigint NOT NULL,
    onr_typ_nr smallint NOT NULL,
    ort_nr integer NOT NULL,
    frt_fzt_zeit integer
);


--
-- TOC entry 178 (class 1259 OID 916613)
-- Dependencies: 7
-- Name: rec_frt_hzt; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE rec_frt_hzt (
    basis_version integer,
    frt_fid bigint NOT NULL,
    onr_typ_nr smallint NOT NULL,
    ort_nr integer NOT NULL,
    frt_hzt_zeit integer
);


--
-- TOC entry 173 (class 1259 OID 591717)
-- Dependencies: 3709 3710 3711 7 1306
-- Name: rec_lid; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE rec_lid (
    basis_version integer NOT NULL,
    li_nr integer NOT NULL,
    str_li_var character(6) NOT NULL,
    routen_nr smallint,
    li_ri_nr smallint,
    bereich_nr smallint,
    li_kuerzel character varying(6),
    lidname character varying(40),
    routen_art smallint,
    linien_code smallint,
    konzessionsinhaber_nr integer,
    auftraggeber_nr integer,
    fremdunternehmer_nr integer,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'LINESTRING'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 174 (class 1259 OID 591726)
-- Dependencies: 3712 3713 3714 7 1306
-- Name: rec_ort; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE rec_ort (
    basis_version integer NOT NULL,
    onr_typ_nr smallint NOT NULL,
    ort_nr integer NOT NULL,
    ort_name character varying(40),
    ort_ref_ort integer,
    ort_ref_ort_typ smallint,
    ort_ref_ort_langnr integer,
    ort_ref_ort_kuerzel character varying(8),
    ort_ref_ort_name character varying(40),
    zone_wabe_nr smallint,
    ort_pos_laenge bigint,
    ort_pos_breite bigint,
    ort_pos_hoehe bigint,
    ort_richtung smallint,
    ort_druckname character varying(40),
    richtungswechsel smallint,
    the_geom public.geometry,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 175 (class 1259 OID 591735)
-- Dependencies: 7
-- Name: sel_fzt_feld; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE sel_fzt_feld (
    basis_version integer NOT NULL,
    bereich_nr smallint NOT NULL,
    fgr_nr integer NOT NULL,
    onr_typ_nr smallint NOT NULL,
    ort_nr integer NOT NULL,
    sel_ziel integer NOT NULL,
    sel_ziel_typ smallint NOT NULL,
    sel_fzt integer
);


--
-- TOC entry 176 (class 1259 OID 712987)
-- Dependencies: 7
-- Name: travel_times; Type: TABLE; Schema: vdv; Owner: -
--

CREATE TABLE travel_times (
    frt_fid bigint NOT NULL,
    li_lfd_nr_start smallint NOT NULL,
    li_lfd_nr_end smallint NOT NULL,
    travel_time integer
);


--
-- TOC entry 183 (class 1259 OID 1091561)
-- Dependencies: 3719 3720 3721 3722 3723 3724 3725 1306 7 1306
-- Name: vehicle_position_act; Type: TABLE; Schema: vdv; Owner: -
--

CREATE UNLOGGED TABLE vehicle_position_act (
    gps_date timestamp(0) with time zone NOT NULL,
    delay_sec integer NOT NULL,
    insert_date timestamp(0) without time zone DEFAULT now() NOT NULL,
    frt_fid bigint NOT NULL,
    the_geom public.geometry,
    li_lfd_nr smallint,
    li_nr integer,
    str_li_var character(6),
    interpolation_linear_ref double precision,
    interpolation_distance double precision,
    extrapolation_linear_ref double precision,
    extrapolation_geom public.geometry,
    arrival_time timestamp without time zone,
    status character(1),
    CONSTRAINT enforce_dims_extrapolation_geom CHECK ((public.st_ndims(extrapolation_geom) = 2)),
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_extrapolation_geom CHECK (((public.geometrytype(extrapolation_geom) = 'POINT'::text) OR (extrapolation_geom IS NULL))),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_extrapolation_geom CHECK ((public.st_srid(extrapolation_geom) = 25832)),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 183
-- Name: COLUMN vehicle_position_act.status; Type: COMMENT; Schema: vdv; Owner: -
--

COMMENT ON COLUMN vehicle_position_act.status IS 'r=run, w=waiting, t=terminated';


--
-- TOC entry 185 (class 1259 OID 1091632)
-- Dependencies: 3727 3728 3729 3730 7 1306
-- Name: vehicle_track; Type: TABLE; Schema: vdv; Owner: -
--

CREATE UNLOGGED TABLE vehicle_track (
    vt_id bigint NOT NULL,
    gps_date timestamp(0) with time zone,
    delay_sec integer,
    route_code integer,
    notification_id character varying,
    notification_date timestamp(0) with time zone,
    notification_validity_date timestamp(0) with time zone,
    acknowledge_date timestamp(0) with time zone,
    insert_date timestamp(0) with time zone DEFAULT now() NOT NULL,
    frt_fid bigint,
    the_geom public.geometry,
    filter integer,
    CONSTRAINT enforce_dims_the_geom CHECK ((public.st_ndims(the_geom) = 2)),
    CONSTRAINT enforce_geotype_the_geom CHECK (((public.geometrytype(the_geom) = 'POINT'::text) OR (the_geom IS NULL))),
    CONSTRAINT enforce_srid_the_geom CHECK ((public.st_srid(the_geom) = 25832))
);


--
-- TOC entry 184 (class 1259 OID 1091630)
-- Dependencies: 185 7
-- Name: vehicle_track_vt_id_seq; Type: SEQUENCE; Schema: vdv; Owner: -
--

CREATE SEQUENCE vehicle_track_vt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3813 (class 0 OID 0)
-- Dependencies: 184
-- Name: vehicle_track_vt_id_seq; Type: SEQUENCE OWNED BY; Schema: vdv; Owner: -
--

ALTER SEQUENCE vehicle_track_vt_id_seq OWNED BY vehicle_track.vt_id;


--
-- TOC entry 3715 (class 2604 OID 985341)
-- Dependencies: 182 181
-- Name: id; Type: DEFAULT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY ort_edges ALTER COLUMN id SET DEFAULT nextval('ort_edges_id_seq'::regclass);


--
-- TOC entry 3726 (class 2604 OID 1091635)
-- Dependencies: 185 184 185
-- Name: vt_id; Type: DEFAULT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY vehicle_track ALTER COLUMN vt_id SET DEFAULT nextval('vehicle_track_vt_id_seq'::regclass);


--
-- TOC entry 3736 (class 2606 OID 591774)
-- Dependencies: 167 167 3806
-- Name: firmenkalender_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY firmenkalender
    ADD CONSTRAINT firmenkalender_pkey PRIMARY KEY (betriebstag);


--
-- TOC entry 3767 (class 2606 OID 768014)
-- Dependencies: 177 177 3806
-- Name: frt_ort_last_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY frt_ort_last
    ADD CONSTRAINT frt_ort_last_pkey PRIMARY KEY (frt_fid);


--
-- TOC entry 3773 (class 2606 OID 919794)
-- Dependencies: 180 180 3806
-- Name: frt_teq_mapping_frt_fid_key; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY frt_teq_mapping
    ADD CONSTRAINT frt_teq_mapping_frt_fid_key UNIQUE (frt_fid);


--
-- TOC entry 3775 (class 2606 OID 919792)
-- Dependencies: 180 180 3806
-- Name: frt_teq_mapping_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY frt_teq_mapping
    ADD CONSTRAINT frt_teq_mapping_pkey PRIMARY KEY (teq_frt_fid);


--
-- TOC entry 3741 (class 2606 OID 1124261)
-- Dependencies: 168 168 168 168 3806
-- Name: lid_verlauf_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY lid_verlauf
    ADD CONSTRAINT lid_verlauf_pkey PRIMARY KEY (li_lfd_nr, li_nr, str_li_var);


--
-- TOC entry 3743 (class 2606 OID 591778)
-- Dependencies: 169 169 3806
-- Name: line_attributes_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY line_attributes
    ADD CONSTRAINT line_attributes_pkey PRIMARY KEY (li_nr);


--
-- TOC entry 3745 (class 2606 OID 591780)
-- Dependencies: 170 170 3806
-- Name: menge_fgr_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY menge_fgr
    ADD CONSTRAINT menge_fgr_pkey PRIMARY KEY (fgr_nr);


--
-- TOC entry 3747 (class 2606 OID 591782)
-- Dependencies: 171 171 3806
-- Name: menge_tagesart_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY menge_tagesart
    ADD CONSTRAINT menge_tagesart_pkey PRIMARY KEY (tagesart_nr);


--
-- TOC entry 3789 (class 2606 OID 1178195)
-- Dependencies: 192 192 3806
-- Name: ort_edges_new_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY ort_edges_new
    ADD CONSTRAINT ort_edges_new_pkey PRIMARY KEY (id);


--
-- TOC entry 3778 (class 2606 OID 985348)
-- Dependencies: 181 181 181 181 181 3806
-- Name: ort_edges_start_ort_nr_start_onr_typ_nr_end_ort_nr_end_onr__key; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY ort_edges
    ADD CONSTRAINT ort_edges_start_ort_nr_start_onr_typ_nr_end_ort_nr_end_onr__key UNIQUE (start_ort_nr, start_onr_typ_nr, end_ort_nr, end_onr_typ_nr);


--
-- TOC entry 3781 (class 2606 OID 985343)
-- Dependencies: 181 181 3806
-- Name: ort_segments_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY ort_edges
    ADD CONSTRAINT ort_segments_pkey PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 916684)
-- Dependencies: 179 179 179 179 3806
-- Name: rec_frt_fzt_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt_fzt
    ADD CONSTRAINT rec_frt_fzt_pkey PRIMARY KEY (frt_fid, onr_typ_nr, ort_nr);


--
-- TOC entry 3769 (class 2606 OID 916682)
-- Dependencies: 178 178 178 178 3806
-- Name: rec_frt_hzt_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt_hzt
    ADD CONSTRAINT rec_frt_hzt_pkey PRIMARY KEY (frt_fid, onr_typ_nr, ort_nr);


--
-- TOC entry 3751 (class 2606 OID 591784)
-- Dependencies: 172 172 3806
-- Name: rec_frt_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt
    ADD CONSTRAINT rec_frt_pkey PRIMARY KEY (frt_fid);


--
-- TOC entry 3756 (class 2606 OID 1124278)
-- Dependencies: 173 173 173 3806
-- Name: rec_lid_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_lid
    ADD CONSTRAINT rec_lid_pkey PRIMARY KEY (li_nr, str_li_var);


--
-- TOC entry 3758 (class 2606 OID 591788)
-- Dependencies: 174 174 174 3806
-- Name: rec_ort_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_ort
    ADD CONSTRAINT rec_ort_pkey PRIMARY KEY (onr_typ_nr, ort_nr);


--
-- TOC entry 3762 (class 2606 OID 591790)
-- Dependencies: 175 175 175 175 175 175 175 3806
-- Name: sel_fzt_feld_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY sel_fzt_feld
    ADD CONSTRAINT sel_fzt_feld_pkey PRIMARY KEY (bereich_nr, fgr_nr, onr_typ_nr, ort_nr, sel_ziel_typ, sel_ziel);


--
-- TOC entry 3765 (class 2606 OID 712991)
-- Dependencies: 176 176 176 176 3806
-- Name: travel_times_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY travel_times
    ADD CONSTRAINT travel_times_pkey PRIMARY KEY (frt_fid, li_lfd_nr_start, li_lfd_nr_end);


--
-- TOC entry 3783 (class 2606 OID 1125697)
-- Dependencies: 183 183 3806
-- Name: vehicle_position_act_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY vehicle_position_act
    ADD CONSTRAINT vehicle_position_act_pkey PRIMARY KEY (frt_fid);


--
-- TOC entry 3787 (class 2606 OID 1091644)
-- Dependencies: 185 185 3806
-- Name: vehicle_tracks_july_pkey; Type: CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY vehicle_track
    ADD CONSTRAINT vehicle_tracks_july_pkey PRIMARY KEY (vt_id);


--
-- TOC entry 3737 (class 1259 OID 768025)
-- Dependencies: 168 3806
-- Name: lid_verlauf_li_lfd_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX lid_verlauf_li_lfd_nr_idx ON lid_verlauf USING btree (li_lfd_nr);


--
-- TOC entry 3738 (class 1259 OID 1124259)
-- Dependencies: 168 168 3806
-- Name: lid_verlauf_li_nr_str_li_var_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX lid_verlauf_li_nr_str_li_var_idx ON lid_verlauf USING btree (li_nr, str_li_var);


--
-- TOC entry 3739 (class 1259 OID 591815)
-- Dependencies: 168 168 3806
-- Name: lid_verlauf_onr_typ_nr_ort_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX lid_verlauf_onr_typ_nr_ort_nr_idx ON lid_verlauf USING btree (onr_typ_nr, ort_nr);


--
-- TOC entry 3776 (class 1259 OID 985346)
-- Dependencies: 181 181 3806
-- Name: ort_edges_end_ort_nr_end_onr_typ_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX ort_edges_end_ort_nr_end_onr_typ_nr_idx ON ort_edges USING btree (end_ort_nr, end_onr_typ_nr);


--
-- TOC entry 3779 (class 1259 OID 985345)
-- Dependencies: 181 181 3806
-- Name: ort_edges_start_ort_nr_start_onr_typ_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX ort_edges_start_ort_nr_start_onr_typ_nr_idx ON ort_edges USING btree (start_ort_nr, start_onr_typ_nr);


--
-- TOC entry 3748 (class 1259 OID 591817)
-- Dependencies: 172 3806
-- Name: rec_frt_fgr_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX rec_frt_fgr_nr_idx ON rec_frt USING btree (fgr_nr);


--
-- TOC entry 3749 (class 1259 OID 1124297)
-- Dependencies: 172 172 3806
-- Name: rec_frt_li_nr_str_li_var_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX rec_frt_li_nr_str_li_var_idx ON rec_frt USING btree (li_nr, str_li_var);


--
-- TOC entry 3752 (class 1259 OID 591819)
-- Dependencies: 172 3806
-- Name: rec_frt_tagesart_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX rec_frt_tagesart_nr_idx ON rec_frt USING btree (tagesart_nr);


--
-- TOC entry 3753 (class 1259 OID 768004)
-- Dependencies: 172 172 172 3806
-- Name: rec_frt_tagesart_nr_um_uid_frt_start_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE UNIQUE INDEX rec_frt_tagesart_nr_um_uid_frt_start_idx ON rec_frt USING btree (tagesart_nr, um_uid, frt_start);


--
-- TOC entry 3754 (class 1259 OID 591820)
-- Dependencies: 173 173 173 3806
-- Name: rec_lid_basis_version_li_nr_routen_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE UNIQUE INDEX rec_lid_basis_version_li_nr_routen_nr_idx ON rec_lid USING btree (basis_version, li_nr, routen_nr);


--
-- TOC entry 3759 (class 1259 OID 591821)
-- Dependencies: 175 3806
-- Name: sel_fzt_feld_fgr_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX sel_fzt_feld_fgr_nr_idx ON sel_fzt_feld USING btree (fgr_nr);


--
-- TOC entry 3760 (class 1259 OID 591822)
-- Dependencies: 175 175 3806
-- Name: sel_fzt_feld_onr_typ_nr_ort_nr_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX sel_fzt_feld_onr_typ_nr_ort_nr_idx ON sel_fzt_feld USING btree (onr_typ_nr, ort_nr);


--
-- TOC entry 3763 (class 1259 OID 591823)
-- Dependencies: 175 175 3806
-- Name: sel_fzt_feld_sel_ziel_typ_sel_ziel_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX sel_fzt_feld_sel_ziel_typ_sel_ziel_idx ON sel_fzt_feld USING btree (sel_ziel_typ, sel_ziel);


--
-- TOC entry 3784 (class 1259 OID 1091645)
-- Dependencies: 185 3806
-- Name: vehicle_track_frt_fid_idx; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX vehicle_track_frt_fid_idx ON vehicle_track USING btree (frt_fid);


--
-- TOC entry 3785 (class 1259 OID 1091646)
-- Dependencies: 185 3806
-- Name: vehicle_track_notification_date; Type: INDEX; Schema: vdv; Owner: -
--

CREATE INDEX vehicle_track_notification_date ON vehicle_track USING btree (notification_date);


--
-- TOC entry 3790 (class 2606 OID 591829)
-- Dependencies: 171 167 3746 3806
-- Name: firmenkalender_tagesart_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY firmenkalender
    ADD CONSTRAINT firmenkalender_tagesart_nr_fkey FOREIGN KEY (tagesart_nr) REFERENCES menge_tagesart(tagesart_nr) DEFERRABLE;


--
-- TOC entry 3799 (class 2606 OID 768015)
-- Dependencies: 3750 172 177 3806
-- Name: frt_ort_last_frt_fid_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY frt_ort_last
    ADD CONSTRAINT frt_ort_last_frt_fid_fkey FOREIGN KEY (frt_fid) REFERENCES rec_frt(frt_fid) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3800 (class 2606 OID 768020)
-- Dependencies: 177 177 174 174 3757 3806
-- Name: frt_ort_last_onr_typ_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY frt_ort_last
    ADD CONSTRAINT frt_ort_last_onr_typ_nr_fkey FOREIGN KEY (onr_typ_nr, ort_nr) REFERENCES rec_ort(onr_typ_nr, ort_nr) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3792 (class 2606 OID 1124284)
-- Dependencies: 168 168 3755 173 173 3806
-- Name: lid_verlauf_li_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY lid_verlauf
    ADD CONSTRAINT lid_verlauf_li_nr_fkey FOREIGN KEY (li_nr, str_li_var) REFERENCES rec_lid(li_nr, str_li_var) DEFERRABLE;


--
-- TOC entry 3791 (class 2606 OID 591839)
-- Dependencies: 3757 174 174 168 168 3806
-- Name: lid_verlauf_onr_typ_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY lid_verlauf
    ADD CONSTRAINT lid_verlauf_onr_typ_nr_fkey FOREIGN KEY (onr_typ_nr, ort_nr) REFERENCES rec_ort(onr_typ_nr, ort_nr) DEFERRABLE;


--
-- TOC entry 3794 (class 2606 OID 767994)
-- Dependencies: 170 3744 172 3806
-- Name: rec_frt_fgr_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt
    ADD CONSTRAINT rec_frt_fgr_nr_fkey FOREIGN KEY (fgr_nr) REFERENCES menge_fgr(fgr_nr) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3803 (class 2606 OID 916671)
-- Dependencies: 172 3750 179 3806
-- Name: rec_frt_fzt_frt_fid_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt_fzt
    ADD CONSTRAINT rec_frt_fzt_frt_fid_fkey FOREIGN KEY (frt_fid) REFERENCES rec_frt(frt_fid) DEFERRABLE;


--
-- TOC entry 3804 (class 2606 OID 916676)
-- Dependencies: 174 3757 174 179 179 3806
-- Name: rec_frt_fzt_ort_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt_fzt
    ADD CONSTRAINT rec_frt_fzt_ort_nr_fkey FOREIGN KEY (ort_nr, onr_typ_nr) REFERENCES rec_ort(ort_nr, onr_typ_nr) DEFERRABLE;


--
-- TOC entry 3801 (class 2606 OID 916661)
-- Dependencies: 3750 172 178 3806
-- Name: rec_frt_hzt_frt_fid_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt_hzt
    ADD CONSTRAINT rec_frt_hzt_frt_fid_fkey FOREIGN KEY (frt_fid) REFERENCES rec_frt(frt_fid) DEFERRABLE;


--
-- TOC entry 3802 (class 2606 OID 916666)
-- Dependencies: 174 3757 174 178 178 3806
-- Name: rec_frt_hzt_ort_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt_hzt
    ADD CONSTRAINT rec_frt_hzt_ort_nr_fkey FOREIGN KEY (ort_nr, onr_typ_nr) REFERENCES rec_ort(ort_nr, onr_typ_nr) DEFERRABLE;


--
-- TOC entry 3795 (class 2606 OID 1124298)
-- Dependencies: 172 172 173 173 3755 3806
-- Name: rec_frt_li_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt
    ADD CONSTRAINT rec_frt_li_nr_fkey FOREIGN KEY (li_nr, str_li_var) REFERENCES rec_lid(li_nr, str_li_var) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3793 (class 2606 OID 591854)
-- Dependencies: 172 3746 171 3806
-- Name: rec_frt_tagesart_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY rec_frt
    ADD CONSTRAINT rec_frt_tagesart_nr_fkey FOREIGN KEY (tagesart_nr) REFERENCES menge_tagesart(tagesart_nr) DEFERRABLE;


--
-- TOC entry 3796 (class 2606 OID 591859)
-- Dependencies: 175 3744 170 3806
-- Name: sel_fzt_feld_fgr_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY sel_fzt_feld
    ADD CONSTRAINT sel_fzt_feld_fgr_nr_fkey FOREIGN KEY (fgr_nr) REFERENCES menge_fgr(fgr_nr) DEFERRABLE;


--
-- TOC entry 3797 (class 2606 OID 591864)
-- Dependencies: 175 175 174 3757 174 3806
-- Name: sel_fzt_feld_onr_typ_nr_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY sel_fzt_feld
    ADD CONSTRAINT sel_fzt_feld_onr_typ_nr_fkey FOREIGN KEY (onr_typ_nr, ort_nr) REFERENCES rec_ort(onr_typ_nr, ort_nr) DEFERRABLE;


--
-- TOC entry 3798 (class 2606 OID 591869)
-- Dependencies: 175 175 3757 174 174 3806
-- Name: sel_fzt_feld_sel_ziel_typ_fkey; Type: FK CONSTRAINT; Schema: vdv; Owner: -
--

ALTER TABLE ONLY sel_fzt_feld
    ADD CONSTRAINT sel_fzt_feld_sel_ziel_typ_fkey FOREIGN KEY (sel_ziel_typ, sel_ziel) REFERENCES rec_ort(onr_typ_nr, ort_nr) DEFERRABLE;


-- Completed on 2014-03-09 22:38:22 CET

--
-- PostgreSQL database dump complete
--

