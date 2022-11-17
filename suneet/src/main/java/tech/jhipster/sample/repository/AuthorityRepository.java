package tech.jhipster.sample.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import tech.jhipster.sample.domain.Authority;

/**
 * Spring Data MongoDB repository for the {@link Authority} entity.
 */
public interface AuthorityRepository extends MongoRepository<Authority, String> {}
