package com.samjones329.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.cassandra.config.AbstractCassandraConfiguration;
import org.springframework.data.cassandra.config.SchemaAction;
import org.springframework.data.cassandra.repository.config.EnableCassandraRepositories;

import com.samjones329.repository.ChannelRepo;
import com.samjones329.repository.ServerRepo;

@Configuration
@PropertySource(value = { "classpath:application.properties" })
@EnableCassandraRepositories(basePackageClasses = { ServerRepo.class, ChannelRepo.class })
public class CassandraCfg extends AbstractCassandraConfiguration {

    @Value("${spring.cassandra.keyspace-name}")
    private String keySpace;

    @Value("${spring.cassandra.schema-action}")
    private String schemaAction;

    @Override
    public SchemaAction getSchemaAction() {
        switch (schemaAction) {
            case "CREATE":
                return SchemaAction.CREATE;
            case "CREATE_IF_NOT_EXISTS":
                return SchemaAction.CREATE_IF_NOT_EXISTS;
            case "RECREATE":
                return SchemaAction.RECREATE;
            case "RECREATE_DROP_UNUSED":
                return SchemaAction.RECREATE_DROP_UNUSED;
        }
        return SchemaAction.NONE;
    }

    @Override
    protected String getKeyspaceName() {
        return keySpace;
    }

}
