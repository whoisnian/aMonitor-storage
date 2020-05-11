-- agents 基础信息表
CREATE TABLE IF NOT EXISTS agents (
  id            SERIAL          PRIMARY KEY,
  token         VARCHAR(64)     UNIQUE NOT NULL,
  distro        VARCHAR(64)     NOT NULL DEFAULT 'unknown',
  kernel        VARCHAR(64)     NOT NULL DEFAULT 'unknown',
  hostname      VARCHAR(255)    NOT NULL DEFAULT 'unknown',
  cpu_model     VARCHAR(255)    NOT NULL DEFAULT 'unknown',
  cpu_cores     SMALLINT        NOT NULL DEFAULT 0,
  ip            VARCHAR(255)    NOT NULL DEFAULT 'unknown',
  status        VARCHAR(64)     NOT NULL DEFAULT 'off',
  deleted       BOOLEAN         NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS index_agents_on_hostname ON agents(hostname);

-- cpuinfos cpu占用统计
CREATE TABLE IF NOT EXISTS cpuinfos (
  id              BIGSERIAL     NOT NULL,
  agent_id        INTEGER       REFERENCES agents(id),
  used_percent    SMALLINT      NOT NULL,
  time            TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('cpuinfos', 'time');
CREATE INDEX IF NOT EXISTS index_cpuinfos_on_agent_id ON cpuinfos(agent_id, time DESC);

-- meminfos 内存占用统计
CREATE TABLE IF NOT EXISTS meminfos (
  id                  BIGSERIAL     NOT NULL,
  agent_id            INTEGER       REFERENCES agents(id),
  ram_total           INTEGER       NOT NULL,
  ram_cached          INTEGER       NOT NULL,
  ram_used            INTEGER       NOT NULL,
  ram_free            INTEGER       NOT NULL,
  ram_avail           INTEGER       NOT NULL,
  ram_used_percent    SMALLINT      NOT NULL,
  swap_total          INTEGER       NOT NULL,
  swap_used           INTEGER       NOT NULL,
  swap_free           INTEGER       NOT NULL,
  swap_used_percent   SMALLINT      NOT NULL,
  time                TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('meminfos', 'time');
CREATE INDEX IF NOT EXISTS index_meminfos_on_agent_id ON meminfos(agent_id, time DESC);

-- loadinfos 平均负载统计
CREATE TABLE IF NOT EXISTS loadinfos (
  id          BIGSERIAL     NOT NULL,
  agent_id    INTEGER       REFERENCES agents(id),
  avg1        SMALLINT      NOT NULL,
  avg5        SMALLINT      NOT NULL,
  avg15       SMALLINT      NOT NULL,
  time        TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('loadinfos', 'time');
CREATE INDEX IF NOT EXISTS index_loadinfos_on_agent_id ON loadinfos(agent_id, time DESC);

-- netinfos 流量统计
CREATE TABLE IF NOT EXISTS netinfos (
  id                BIGSERIAL     NOT NULL,
  agent_id          INTEGER       REFERENCES agents(id),
  receive_rate      INTEGER       NOT NULL,
  receive_sum       BIGINT        NOT NULL,
  receive_packets   INTEGER       NOT NULL,
  transmit_rate     INTEGER       NOT NULL,
  transmit_sum      BIGINT        NOT NULL,
  transmit_packets  INTEGER       NOT NULL,
  time              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('netinfos', 'time');
CREATE INDEX IF NOT EXISTS index_netinfos_on_agent_id ON netinfos(agent_id, time DESC);

-- diskinfos 磁盘读写统计
CREATE TABLE IF NOT EXISTS diskinfos (
  id            BIGSERIAL     NOT NULL,
  agent_id      INTEGER       REFERENCES agents(id),
  read_req      INTEGER       NOT NULL,
  write_req     INTEGER       NOT NULL,
  read_rate     INTEGER       NOT NULL,
  write_rate    INTEGER       NOT NULL,
  read_size     BIGINT        NOT NULL,
  write_size    BIGINT        NOT NULL,
  time          TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('diskinfos', 'time');
CREATE INDEX IF NOT EXISTS index_diskinfos_on_agent_id ON diskinfos(agent_id, time DESC);

-- mountinfos 挂载点统计
CREATE TABLE IF NOT EXISTS mountinfos (
  id                    BIGSERIAL       NOT NULL,
  agent_id              INTEGER         REFERENCES agents(id),
  dev_name              VARCHAR(255)    NOT NULL,
  mount_point           VARCHAR(4096)   NOT NULL,
  fs_type               VARCHAR(64)     NOT NULL,
  total_size            BIGINT          NOT NULL,
  free_size             BIGINT          NOT NULL,
  avail_size            BIGINT          NOT NULL,
  used_size_percent     SMALLINT        NOT NULL,
  total_nodes           BIGINT          NOT NULL,
  free_nodes            BIGINT          NOT NULL,
  used_nodes_percent    SMALLINT        NOT NULL,
  time                  TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('mountinfos', 'time');
CREATE INDEX IF NOT EXISTS index_mountinfos_on_agent_id ON mountinfos(agent_id, dev_name, time DESC);

-- sshdinfos ssh登录事件统计
CREATE TABLE IF NOT EXISTS sshdinfos (
  id            BIGSERIAL     NOT NULL,
  agent_id      INTEGER       REFERENCES agents(id),
  username      VARCHAR(32)   NOT NULL,
  remote_host   VARCHAR(64)   NOT NULL,
  auth_method   TEXT          NOT NULL,
  time          TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('sshdinfos', 'time');
CREATE INDEX IF NOT EXISTS index_sshdinfos_on_agent_id ON sshdinfos(agent_id, time DESC);

-- filemdinfos 指定文件修改删除事件统计
CREATE TABLE IF NOT EXISTS filemdinfos (
  id          BIGSERIAL       NOT NULL,
  agent_id    INTEGER         REFERENCES agents(id),
  path        VARCHAR(4096)   NOT NULL,
  event       VARCHAR(16)     NOT NULL,
  time        TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('filemdinfos', 'time');
CREATE INDEX IF NOT EXISTS index_filemdinfos_on_agent_id ON filemdinfos(agent_id, time DESC);

-- users 用户基础信息
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL          PRIMARY KEY,
  email         VARCHAR(255)    UNIQUE NOT NULL,
  username      VARCHAR(64)     NOT NULL,
  password      VARCHAR(64)     NOT NULL,
  deleted       BOOLEAN         NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- rules 监控规则
CREATE TABLE IF NOT EXISTS rules (
  id            SERIAL          PRIMARY KEY,
  name          VARCHAR(255)    NOT NULL,
  target        VARCHAR(255)    NOT NULL,
  addition      VARCHAR(4096),
  event         VARCHAR(255)    NOT NULL,
  threshold     INTEGER,
  interval      INTEGER,
  silent        INTEGER,
  level         VARCHAR(64)     NOT NULL,
  group_id      INTEGER         REFERENCES rulegroups(id),
  deleted       BOOLEAN         NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- rulegroups 规则组
CREATE TABLE IF NOT EXISTS rulegroups (
  id            SERIAL          PRIMARY KEY,
  name          VARCHAR(255)    NOT NULL,
  deleted       BOOLEAN         NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- agentrules 主机所用规则
CREATE TABLE IF NOT EXISTS agentrules (
  id            SERIAL          PRIMARY KEY,
  agent_id      INTEGER         REFERENCES agents(id),
  rule_id       INTEGER         REFERENCES rules(id),
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- receivers 接收者
CREATE TABLE IF NOT EXISTS receivers (
  id            SERIAL          PRIMARY KEY,
  name          VARCHAR(255)    NOT NULL,
  type          VARCHAR(64)     NOT NULL,
  addr          VARCHAR(4096)   NOT NULL,
  token         VARCHAR(255)    NOT NULL,
  deleted       BOOLEAN         NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- receivergroups 接收者所属规则组
CREATE TABLE IF NOT EXISTS receivergroups (
  id            SERIAL          PRIMARY KEY,
  receiver_id   INTEGER         REFERENCES receivers(id),
  group_id      INTEGER         REFERENCES rulegroups(id),
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- messages 报警信息
CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL          PRIMARY KEY,
  content       TEXT            NOT NULL,
  agent_id      INTEGER         REFERENCES agents(id),
  rule_id       INTEGER         REFERENCES rules(id),
  group_id      INTEGER         REFERENCES rulegroups(id),
  level         VARCHAR(64)     NOT NULL,
  deleted       BOOLEAN         NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
