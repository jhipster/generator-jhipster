package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.MyEntity;
import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the MyEntity entity.
 */
public interface MyEntityRepository extends JpaRepository<MyEntity,Long> {

}
